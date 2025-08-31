import {
	Injectable,
	Logger,
	NotFoundException,
	ForbiddenException,
	InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import {
	NotificationEnum,
	UserRoleEnum,
	NotificationAudienceEnum,
} from '../../common/enum/entity.enum';

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name);
	private transporter: nodemailer.Transporter;

	constructor(
		@InjectRepository(Notification)
		private readonly notificationRepository: Repository<Notification>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly configService: ConfigService
	) {
		this.transporter = nodemailer.createTransport({
			host: this.configService.get<string>('email.host'),
			port: this.configService.get<number>('email.port'),
			secure: this.configService.get<boolean>('email.secure'),
			auth: this.configService.get<boolean>('email.secure')
				? {
						user: this.configService.get<string>('email.user'),
						pass: this.configService.get<string>('email.pass'),
					}
				: undefined,
		});

		// Register Handlebars helpers to format dates in Handlebars:
		Handlebars.registerHelper('formatDate', (date: Date) => {
			return new Intl.DateTimeFormat('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			}).format(new Date(date));
		});
	}

	private async getAudienceRecipients(audience: NotificationAudienceEnum) {
		switch (audience) {
			case NotificationAudienceEnum.ADMINS:
				return this.userRepository.find({
					where: {
						role: In([
							UserRoleEnum.ADMIN,
							UserRoleEnum.MANAGER,
							UserRoleEnum.DEV,
						]),
					},
				});
			case NotificationAudienceEnum.ALL_EXCEPT_UNKNOWN:
				return this.userRepository.find({
					where: {
						role: In([
							UserRoleEnum.ADMIN,
							UserRoleEnum.MANAGER,
							UserRoleEnum.DEV,
							UserRoleEnum.SALES,
							UserRoleEnum.CUSTOMER,
						]),
					},
				});
			case NotificationAudienceEnum.ALL:
			default:
				return this.userRepository.find();
		}
	}

	async notifyAdminsOnNewUser(user: User) {
		try {
			const audience = NotificationAudienceEnum.ADMINS;
			const recipients = await this.getAudienceRecipients(audience);

			if (recipients.length === 0) {
				this.logger.warn('No recipients found for notification.');
				return { notified: 0 };
			}

			const title = 'New User Registration - Role Assignment Required';
			const adminPanelUrl = `${this.configService.get<string>('app.frontendUrl')}/admin/users`;

			// Create a single broadcast notification (no user_id)
			const notification = this.notificationRepository.create({
				type: NotificationEnum.SYSTEM_ALERT,
				title,
				message: `${user.fullName || user.email} registered and is awaiting role assignment.`,
				audience,
				metadata: {
					newUserId: user.id,
					email: user.email,
					fullName: user.fullName,
					adminPanelUrl,
				},
			});
			const savedNotification =
				await this.notificationRepository.save(notification);

			// Send emails to all recipients
			await Promise.all(
				recipients.map(async (recipient) => {
					try {
						const html = this.renderTemplate(
							'notify-admin-new-user',
							{
								user: {
									id: user.id,
									email: user.email,
									fullName: user.fullName || 'Not provided',
									createdAt: user.createdAt,
								},
								adminPanelUrl,
								title: 'New User Registration',
							}
						);

						await this.sendEmail({
							to: recipient.email,
							subject: title,
							html,
						});
					} catch (err) {
						this.logger.error(
							`Failed to email ${recipient.email}: ${err.message}`
						);
					}
				})
			);

			// Mark the broadcast notification as emailed
			savedNotification.emailSent = true;
			await this.notificationRepository.save(savedNotification);

			return { notified: recipients.length };
		} catch (err) {
			this.logger.error(
				'Failed to notify admins on new user',
				err?.stack || String(err)
			);
			throw new InternalServerErrorException(
				'Failed to send notifications'
			);
		}
	}

	async getUserNotifications(userId: string) {
		try {
			// Fetch notifications that target the user's role via audience OR are specific to the user
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});
			if (!user) return [];
			const visibleAudiences = [
				NotificationAudienceEnum.ALL,
				NotificationAudienceEnum.ALL_EXCEPT_UNKNOWN,
			];
			if (
				[
					UserRoleEnum.ADMIN,
					UserRoleEnum.MANAGER,
					UserRoleEnum.DEV,
				].includes(user.role)
			) {
				visibleAudiences.push(NotificationAudienceEnum.ADMINS);
			}
			return await this.notificationRepository.find({
				where: [
					{ audience: In(visibleAudiences) as any },
					{ user: { id: userId } as any },
				] as any,
				order: { createdAt: 'DESC' as any },
			});
		} catch (err) {
			throw new InternalServerErrorException(
				'Failed to fetch notifications'
			);
		}
	}

	async getUnreadCount(userId: string) {
		try {
			const notifications = await this.getUserNotifications(userId);
			const count = notifications.filter((n) => !n.isRead).length;
			return { count };
		} catch (err) {
			throw new InternalServerErrorException(
				'Failed to count unread notifications'
			);
		}
	}

	async markAsRead(notificationId: string, userId: string) {
		try {
			const notification = await this.notificationRepository.findOne({
				where: { id: notificationId },
				relations: ['user'],
				select: {
					id: true,
					isRead: true,
					user: { id: true } as any,
				} as any,
			});
			if (!notification) {
				throw new NotFoundException('Notification not found');
			}
			// Broadcast notifications have no user; allow any recipient to mark as read client-side if desired.
			if (notification.user && notification.user.id !== userId) {
				throw new ForbiddenException(
					"Cannot modify others' notifications"
				);
			}
			if (!notification.isRead) {
				await this.notificationRepository.update(
					{ id: notification.id },
					{ isRead: true }
				);
			}
			return { message: 'Notification marked as read' };
		} catch (err) {
			if (
				err instanceof NotFoundException ||
				err instanceof ForbiddenException
			) {
				throw err;
			}
			// throw new InternalServerErrorException('Failed to mark notification as read');
			throw err;
		}
	}

	async sendEmail({
		to,
		subject,
		html,
	}: {
		to: string;
		subject: string;
		html: string;
	}) {
		const fromName = this.configService.get<string>(
			'email.defaultFromName'
		);
		const fromEmail = this.configService.get<string>(
			'email.defaultFromEmail'
		);

		const info = await this.transporter.sendMail({
			from: `${fromName} <${fromEmail}>`,
			to,
			subject,
			html,
		});

		this.logger.log(`Email sent: ${info.messageId}`);
		return info;
	}

	renderTemplate(templateName: string, context: any) {
		const templateDir =
			this.configService.get<string>('email.templateDir') ||
			'templates/email';
		const layoutPath = path.resolve(templateDir, 'layout.hbs');
		const templatePath = path.resolve(templateDir, `${templateName}.hbs`);

		const layoutSrc = fs.readFileSync(layoutPath, 'utf8');
		const templateSrc = fs.readFileSync(templatePath, 'utf8');

		// Support partial-like layout injection
		const layout = Handlebars.compile(layoutSrc);
		const content = Handlebars.compile(templateSrc)(context);

		return layout({
			title: context.title || 'Car Parts Shop',
			body: content,
		});
	}

	async notifyVehicleCreated(vehicle: any, createdByUser: User) {
		try {
			const audience = NotificationAudienceEnum.ADMINS;
			const recipients = await this.getAudienceRecipients(audience);

			if (recipients.length === 0) {
				this.logger.warn(
					'No recipients found for vehicle creation notification.'
				);
				return { notified: 0 };
			}

			const title = 'New Vehicle Added to Inventory';
			const vehicleUrl = `${this.configService.get<string>('app.frontendUrl')}/admin/vehicles/${vehicle.id}`;

			// Create a single broadcast notification
			const notification = this.notificationRepository.create({
				type: NotificationEnum.SYSTEM_ALERT,
				title,
				message: `New vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) added by ${createdByUser.fullName || createdByUser.email}.`,
				audience,
				metadata: {
					vehicleId: vehicle.id,
					make: vehicle.make,
					model: vehicle.model,
					year: vehicle.year,
					vin: vehicle.vin,
					purchasePrice: vehicle.purchasePrice,
					createdBy: createdByUser.id,
					createdByEmail: createdByUser.email,
					createdByFullName: createdByUser.fullName,
					vehicleUrl,
				},
			});
			await this.notificationRepository.save(notification);

			// Send emails to all recipients
			await Promise.all(
				recipients.map(async (recipient) => {
					try {
						const html = this.renderTemplate(
							'notify-vehicle-created',
							{
								vehicle: {
									make: vehicle.make,
									model: vehicle.model,
									year: vehicle.year,
									vin: vehicle.vin,
									purchasePrice: vehicle.purchasePrice,
									description: vehicle.description,
									auctionName: vehicle.auctionName,
									createdAt: vehicle.createdAt,
								},
								createdBy: {
									fullName:
										createdByUser.fullName ||
										'Unknown User',
									email: createdByUser.email,
								},
								vehicleUrl,
							}
						);
						await this.sendEmail({
							to: recipient.email,
							subject: title,
							html,
						});
					} catch (emailErr) {
						this.logger.error(
							`Failed to send email to ${recipient.email}`,
							emailErr?.stack || String(emailErr)
						);
					}
				})
			);

			return { notified: recipients.length };
		} catch (err) {
			this.logger.error(
				'Failed to notify on vehicle creation',
				err?.stack || String(err)
			);
			throw new InternalServerErrorException(
				'Failed to send vehicle creation notifications'
			);
		}
	}

	async notifyVehicleUpdated(
		vehicle: any,
		updatedByUser: User,
		changes: string[]
	) {
		try {
			const audience = NotificationAudienceEnum.ADMINS;
			const recipients = await this.getAudienceRecipients(audience);

			if (recipients.length === 0) {
				this.logger.warn(
					'No recipients found for vehicle update notification.'
				);
				return { notified: 0 };
			}

			const title = 'Vehicle Information Updated';
			const vehicleUrl = `${this.configService.get<string>('app.frontendUrl')}/admin/vehicles/${vehicle.id}`;

			// Create a single broadcast notification
			const notification = this.notificationRepository.create({
				type: NotificationEnum.SYSTEM_ALERT,
				title,
				message: `Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) updated by ${updatedByUser.fullName || updatedByUser.email}. Changes: ${changes.join(', ')}.`,
				audience,
				metadata: {
					vehicleId: vehicle.id,
					make: vehicle.make,
					model: vehicle.model,
					year: vehicle.year,
					vin: vehicle.vin,
					changes,
					updatedBy: updatedByUser.id,
					updatedByEmail: updatedByUser.email,
					updatedByFullName: updatedByUser.fullName,
					vehicleUrl,
				},
			});
			await this.notificationRepository.save(notification);

			// Send emails to all recipients
			await Promise.all(
				recipients.map(async (recipient) => {
					try {
						const html = this.renderTemplate(
							'notify-vehicle-updated',
							{
								vehicle: {
									make: vehicle.make,
									model: vehicle.model,
									year: vehicle.year,
									vin: vehicle.vin,
									changes,
								},
								updatedBy: {
									fullName:
										updatedByUser.fullName ||
										'Unknown User',
									email: updatedByUser.email,
								},
								vehicleUrl,
							}
						);
						await this.sendEmail({
							to: recipient.email,
							subject: title,
							html,
						});
					} catch (emailErr) {
						this.logger.error(
							`Failed to send email to ${recipient.email}`,
							emailErr?.stack || String(emailErr)
						);
					}
				})
			);

			return { notified: recipients.length };
		} catch (err) {
			this.logger.error(
				'Failed to notify on vehicle update',
				err?.stack || String(err)
			);
			throw new InternalServerErrorException(
				'Failed to send vehicle update notifications'
			);
		}
	}

	async notifyVehicleDeleted(vehicle: any, deletedByUser: User) {
		try {
			const audience = NotificationAudienceEnum.ADMINS;
			const recipients = await this.getAudienceRecipients(audience);

			if (recipients.length === 0) {
				this.logger.warn(
					'No recipients found for vehicle deletion notification.'
				);
				return { notified: 0 };
			}

			const title = 'Vehicle Removed from Inventory';
			const adminUrl = `${this.configService.get<string>('app.frontendUrl')}/admin/vehicles`;

			// Create a single broadcast notification
			const notification = this.notificationRepository.create({
				type: NotificationEnum.SYSTEM_ALERT,
				title,
				message: `Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) with VIN ${vehicle.vin} was removed by ${deletedByUser.fullName || deletedByUser.email}.`,
				audience,
				metadata: {
					make: vehicle.make,
					model: vehicle.model,
					year: vehicle.year,
					vin: vehicle.vin,
					deletedBy: deletedByUser.id,
					deletedByEmail: deletedByUser.email,
					deletedByFullName: deletedByUser.fullName,
					adminUrl,
				},
			});
			await this.notificationRepository.save(notification);

			// Send emails to all recipients
			await Promise.all(
				recipients.map(async (recipient) => {
					try {
						const html = this.renderTemplate(
							'notify-vehicle-deleted',
							{
								vehicle: {
									make: vehicle.make,
									model: vehicle.model,
									year: vehicle.year,
									vin: vehicle.vin,
								},
								deletedBy: {
									fullName:
										deletedByUser.fullName ||
										'Unknown User',
									email: deletedByUser.email,
								},
								adminUrl,
							}
						);
						await this.sendEmail({
							to: recipient.email,
							subject: title,
							html,
						});
					} catch (emailErr) {
						this.logger.error(
							`Failed to send email to ${recipient.email}`,
							emailErr?.stack || String(emailErr)
						);
					}
				})
			);

			return { notified: recipients.length };
		} catch (err) {
			this.logger.error(
				'Failed to notify on vehicle deletion',
				err?.stack || String(err)
			);
			throw new InternalServerErrorException(
				'Failed to send vehicle deletion notifications'
			);
		}
	}

	async notifyVehiclePartedOut(vehicle: any, updatedByUser: User) {
		try {
			const audience = NotificationAudienceEnum.ADMINS;
			const recipients = await this.getAudienceRecipients(audience);

			const title = 'Vehicle Marked as Parted Out';
			const vehicleUrl = `${this.configService.get<string>('app.frontendUrl')}/admin/vehicles/${vehicle.id}`;

			// Create a single broadcast notification
			const notification = this.notificationRepository.create({
				type: NotificationEnum.SYSTEM_ALERT,
				title,
				message: `Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) has been marked as parted out by ${updatedByUser.fullName || updatedByUser.email}.`,
				audience,
				metadata: {
					vehicleId: vehicle.id,
					make: vehicle.make,
					model: vehicle.model,
					year: vehicle.year,
					vin: vehicle.vin,
					updatedBy: updatedByUser.id,
					updatedByEmail: updatedByUser.email,
					updatedByFullName: updatedByUser.fullName,
					vehicleUrl,
				},
			});
			await this.notificationRepository.save(notification);

			// Send emails to all recipients
			await Promise.all(
				recipients.map(async (recipient) => {
					try {
						const html = this.renderTemplate(
							'notify-vehicle-parted-out',
							{
								vehicle: {
									make: vehicle.make,
									model: vehicle.model,
									year: vehicle.year,
									vin: vehicle.vin,
								},
								updatedBy: {
									fullName:
										updatedByUser.fullName ||
										'Unknown User',
									email: updatedByUser.email,
								},
								vehicleUrl,
							}
						);
						await this.sendEmail({
							to: recipient.email,
							subject: title,
							html,
						});
					} catch (emailErr) {
						this.logger.error(
							`Failed to send email to ${recipient.email}`,
							emailErr?.stack || String(emailErr)
						);
					}
				})
			);

			return { notified: recipients.length };
		} catch (err) {
			this.logger.error(
				'Failed to notify on vehicle parted out',
				err?.stack || String(err)
			);
			throw new InternalServerErrorException(
				'Failed to send vehicle parted out notifications'
			);
		}
	}
}
