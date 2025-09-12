import {
	Injectable,
	Logger,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, Not } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { EmailService } from './email.service';
import { NotificationGateway } from './notification.gateway';
import {
	CreateNotificationDto,
	SendNotificationDto,
	BatchSendNotificationDto,
	MarkAsReadDto,
	NotificationFilterDto,
} from '../../dto/request/notification.dto';
import {
	NotificationResponseDto,
	SendNotificationResultDto,
	BatchSendResultDto,
} from '../../dto/response/notification.dto';
import {
	NotificationEnum,
	NotificationAudienceEnum,
	NotificationChannelEnum,
} from '../../common/enum/notification.enum';
import { UserRoleEnum } from '../../common/enum/entity.enum';

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name);

	constructor(
		@InjectRepository(Notification)
		private readonly notificationRepository: Repository<Notification>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly emailService: EmailService,
		private readonly notificationGateway: NotificationGateway
	) {}

	// Create a notification without sending
	async createNotification(
		dto: CreateNotificationDto
	): Promise<NotificationResponseDto> {
		const notification = this.notificationRepository.create({
			type: dto.type,
			title: dto.title,
			message: dto.message,
			metadata: dto.metadata,
			user: dto.userId ? { id: dto.userId } : null,
		});

		const saved = await this.notificationRepository.save(notification);
		return this.mapToResponseDto(saved);
	}

	// Send notification to specific audience
	async sendNotification(
		dto: SendNotificationDto
	): Promise<SendNotificationResultDto> {
		const recipients = await this.getRecipients(dto.audience, dto.userIds);

		if (recipients.length === 0) {
			throw new BadRequestException(
				'No recipients found for the specified audience'
			);
		}

		const result: SendNotificationResultDto = {
			success: true,
			totalRecipients: recipients.length,
			emailsSent: 0,
			emailsFailed: 0,
			websocketsSent: 0,
			notificationIds: [],
			errors: [],
		};

		// Create notifications for each recipient
		const notifications: Notification[] = [];
		for (const user of recipients) {
			const notification = this.notificationRepository.create({
				type: dto.type,
				title: dto.title,
				message: dto.message,
				metadata: dto.metadata,
				user: { id: user.id },
				emailSent: false,
			});
			notifications.push(notification);
		}

		const savedNotifications =
			await this.notificationRepository.save(notifications);
		result.notificationIds = savedNotifications.map((n) => n.id);

		// Send via WebSocket if enabled
		if (
			dto.channel === NotificationChannelEnum.WEBSOCKET ||
			dto.channel === NotificationChannelEnum.BOTH
		) {
			for (const notification of savedNotifications) {
				try {
					const notificationData =
						this.mapToResponseDto(notification);
					this.notificationGateway.sendToUser(
						notification.user!.id,
						notificationData
					);
					result.websocketsSent++;
				} catch (error) {
					this.logger.error(
						`Failed to send WebSocket notification to user ${notification.user!.id}:`,
						error
					);
					result.errors?.push(
						`WebSocket failed for user ${notification.user!.id}`
					);
				}
			}
		}

		// Send via Email if enabled
		if (
			dto.channel === NotificationChannelEnum.EMAIL ||
			dto.channel === NotificationChannelEnum.BOTH
		) {
			const template =
				dto.emailTemplate ||
				this.emailService.getTemplateForNotificationType(dto.type);

			for (const notification of savedNotifications) {
				const user = recipients.find(
					(r) => r.id === notification.user!.id
				);
				if (!user?.email) continue;

				const emailContext = {
					title: dto.title,
					message: dto.message,
					userName: `${user.fullName}`.trim() || user.email,
					userEmail: user.email,
					metadata: dto.metadata,
					notificationId: notification.id,
					actionUrl: this.getActionUrl(dto.type, dto.metadata),
				};

				const emailSent = await this.emailService.sendEmail({
					to: user.email,
					subject: dto.title,
					template,
					context: emailContext,
				});

				if (emailSent) {
					result.emailsSent++;
					// Update notification to mark email as sent
					await this.notificationRepository.update(notification.id, {
						emailSent: true,
					});
				} else {
					result.emailsFailed++;
					result.errors?.push(`Email failed for user ${user.email}`);
				}
			}
		}

		result.success =
			result.emailsFailed === 0 &&
			(!result.errors || result.errors.length === 0);
		return result;
	}

	// Batch send notifications
	async batchSendNotifications(
		dto: BatchSendNotificationDto
	): Promise<BatchSendResultDto> {
		const results: SendNotificationResultDto[] = [];
		let successfulBatches = 0;
		let failedBatches = 0;

		for (const notification of dto.notifications) {
			try {
				const result = await this.sendNotification(notification);
				results.push(result);
				if (result.success) {
					successfulBatches++;
				} else {
					failedBatches++;
				}
			} catch (error) {
				this.logger.error('Failed to send batch notification:', error);
				failedBatches++;
				results.push({
					success: false,
					totalRecipients: 0,
					emailsSent: 0,
					emailsFailed: 0,
					websocketsSent: 0,
					notificationIds: [],
					errors: [error.message],
				});
			}
		}

		return {
			totalBatches: dto.notifications.length,
			successfulBatches,
			failedBatches,
			results,
		};
	}

	// Mark notifications as read
	async markAsRead(dto: MarkAsReadDto, userId: string): Promise<void> {
		const notifications = await this.notificationRepository.find({
			where: {
				id: In(dto.notificationIds),
				user: { id: userId },
			},
		});

		if (notifications.length === 0) {
			throw new BadRequestException(
				'No notifications found to mark as read'
			);
		}

		await this.notificationRepository.update(
			{ id: In(notifications.map((n) => n.id)) },
			{ isRead: true }
		);

		// Notify via WebSocket
		for (const notification of notifications) {
			this.notificationGateway.sendToUser(userId, {
				event: 'notificationRead',
				notificationId: notification.id,
			});
		}
	}

	// Get notifications with filters
	async getNotifications(filter: NotificationFilterDto): Promise<any> {
		const { page = 1, limit = 20, ...restFilter } = filter;
		const skip = (page - 1) * limit;

		const query = this.notificationRepository
			.createQueryBuilder('notification')
			.leftJoinAndSelect('notification.user', 'user');

		// Apply filters
		if (restFilter.type) {
			query.andWhere('notification.type = :type', {
				type: restFilter.type,
			});
		}

		if (restFilter.isRead !== undefined) {
			query.andWhere('notification.isRead = :isRead', {
				isRead: restFilter.isRead,
			});
		}

		if (restFilter.userId) {
			query.andWhere('notification.user.id = :userId', {
				userId: restFilter.userId,
			});
		}

		if (restFilter.search) {
			query.andWhere(
				'(notification.title ILIKE :search OR notification.message ILIKE :search)',
				{ search: `%${restFilter.search}%` }
			);
		}

		// Get total count for pagination
		const total = await query.getCount();

		// Apply pagination
		query.orderBy('notification.createdAt', 'DESC').skip(skip).take(limit);

		const notifications = await query.getMany();

		// Calculate pagination metadata
		const totalPages = Math.ceil(total / limit);
		const hasNext = page < totalPages;
		const hasPrev = page > 1;

		// Return in the format expected by the interceptor
		return {
			items: notifications.map((n) => this.mapToResponseDto(n)),
			total,
			page,
			limit,
			totalPages,
			hasNext,
			hasPrev,
		};
	}

	// Get unread count for a user
	async getUnreadCount(userId: string): Promise<number> {
		return this.notificationRepository.count({
			where: {
				user: { id: userId },
				isRead: false,
			},
		});
	}

	// Delete old notifications (cleanup job)
	async deleteOldNotifications(daysToKeep: number = 30): Promise<number> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

		const result = await this.notificationRepository
			.createQueryBuilder()
			.delete()
			.where('createdAt < :cutoffDate', { cutoffDate })
			.andWhere('isRead = :isRead', { isRead: true })
			.execute();

		this.logger.log(`Deleted ${result.affected} old notifications`);
		return result.affected || 0;
	}

	// Get notification by ID with permission check
	async getNotificationById(
		id: string,
		userId: string
	): Promise<NotificationResponseDto> {
		const notification = await this.notificationRepository.findOne({
			where: { id },
			relations: ['user'],
		});

		if (!notification) {
			throw new NotFoundException(`Notification with ID ${id} not found`);
		}

		// Check if user has permission to view this notification
		if (notification.user && notification.user.id !== userId) {
			// Check if user is admin or manager
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});
			if (
				!user ||
				(user.role !== UserRoleEnum.ADMIN &&
					user.role !== UserRoleEnum.MANAGER)
			) {
				throw new BadRequestException(
					'You do not have permission to view this notification'
				);
			}
		}

		return this.mapToResponseDto(notification);
	}

	// Private helper methods
	private async getRecipients(
		audience: NotificationAudienceEnum,
		userIds?: string[]
	): Promise<User[]> {
		let query = this.userRepository.createQueryBuilder('user');

		switch (audience) {
			case NotificationAudienceEnum.ALL:
				// All active users
				query = query.where('user.isActive = :isActive', {
					isActive: true,
				});
				break;

			case NotificationAudienceEnum.ADMIN:
				// DEV, MANAGER, ADMIN
				query = query.where('user.role IN (:...roles)', {
					roles: [
						UserRoleEnum.DEV,
						UserRoleEnum.MANAGER,
						UserRoleEnum.ADMIN,
					],
				});
				break;

			case NotificationAudienceEnum.MANAGER:
				// MANAGER and above
				query = query.where('user.role IN (:...roles)', {
					roles: [UserRoleEnum.MANAGER, UserRoleEnum.ADMIN],
				});
				break;

			case NotificationAudienceEnum.STAFF:
				// STAFF and above
				query = query.where('user.role IN (:...roles)', {
					roles: [
						UserRoleEnum.STAFF,
						UserRoleEnum.MANAGER,
						UserRoleEnum.ADMIN,
					],
				});
				break;

			case NotificationAudienceEnum.SPECIFIC_USER:
				if (!userIds || userIds.length === 0) {
					throw new BadRequestException(
						'User IDs required for SPECIFIC_USER audience'
					);
				}
				query = query.where('user.id IN (:...userIds)', { userIds });
				break;
		}

		return query.getMany();
	}

	private getActionUrl(
		type: NotificationEnum,
		metadata?: Record<string, any>
	): string {
		const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

		switch (type) {
			case NotificationEnum.PASSWORD_RESET:
				return `${baseUrl}/reset-password?token=${metadata?.resetToken}`;
			case NotificationEnum.ACCOUNT_VERIFIED:
				return `${baseUrl}/login`;
			case NotificationEnum.VEHICLE_CREATED:
			case NotificationEnum.VEHICLE_UPDATED:
				return `${baseUrl}/vehicles/${metadata?.vehicleId}`;
			case NotificationEnum.PART_CREATED:
			case NotificationEnum.PART_UPDATED:
				return `${baseUrl}/parts/${metadata?.partId}`;
			case NotificationEnum.ORDER_CREATED:
			case NotificationEnum.ORDER_UPDATED:
				return `${baseUrl}/orders/${metadata?.orderId}`;
			case NotificationEnum.REPORT_READY:
				return `${baseUrl}/reports/${metadata?.reportId}`;
			default:
				return `${baseUrl}/notifications`;
		}
	}

	private mapToResponseDto(
		notification: Notification
	): NotificationResponseDto {
		return {
			id: notification.id,
			type: notification.type,
			title: notification.title,
			message: notification.message,
			isRead: notification.isRead,
			metadata: notification.metadata,
			userId: notification.user?.id,
			emailSent: notification.emailSent,
			createdAt: notification.createdAt,
			updatedAt: notification.updatedAt,
		};
	}
}
