"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../../entities/notification.entity");
const user_entity_1 = require("../../entities/user.entity");
const email_service_1 = require("./email.service");
const notification_gateway_1 = require("./notification.gateway");
const notification_enum_1 = require("../../common/enum/notification.enum");
const entity_enum_1 = require("../../common/enum/entity.enum");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationRepository, userRepository, emailService, notificationGateway) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.notificationGateway = notificationGateway;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async createNotification(dto) {
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
    async sendNotification(dto) {
        const recipients = await this.getRecipients(dto.audience, dto.userIds);
        if (recipients.length === 0) {
            throw new common_1.BadRequestException('No recipients found for the specified audience');
        }
        const result = {
            success: true,
            totalRecipients: recipients.length,
            emailsSent: 0,
            emailsFailed: 0,
            websocketsSent: 0,
            notificationIds: [],
            errors: [],
        };
        const notifications = [];
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
        const savedNotifications = await this.notificationRepository.save(notifications);
        result.notificationIds = savedNotifications.map(n => n.id);
        if (dto.channel === notification_enum_1.NotificationChannelEnum.WEBSOCKET || dto.channel === notification_enum_1.NotificationChannelEnum.BOTH) {
            for (const notification of savedNotifications) {
                try {
                    const notificationData = this.mapToResponseDto(notification);
                    this.notificationGateway.sendToUser(notification.user.id, notificationData);
                    result.websocketsSent++;
                }
                catch (error) {
                    this.logger.error(`Failed to send WebSocket notification to user ${notification.user.id}:`, error);
                    result.errors?.push(`WebSocket failed for user ${notification.user.id}`);
                }
            }
        }
        if (dto.channel === notification_enum_1.NotificationChannelEnum.EMAIL || dto.channel === notification_enum_1.NotificationChannelEnum.BOTH) {
            const template = dto.emailTemplate || this.emailService.getTemplateForNotificationType(dto.type);
            for (const notification of savedNotifications) {
                const user = recipients.find(r => r.id === notification.user.id);
                if (!user?.email)
                    continue;
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
                    await this.notificationRepository.update(notification.id, { emailSent: true });
                }
                else {
                    result.emailsFailed++;
                    result.errors?.push(`Email failed for user ${user.email}`);
                }
            }
        }
        result.success = result.emailsFailed === 0 && (!result.errors || result.errors.length === 0);
        return result;
    }
    async batchSendNotifications(dto) {
        const results = [];
        let successfulBatches = 0;
        let failedBatches = 0;
        for (const notification of dto.notifications) {
            try {
                const result = await this.sendNotification(notification);
                results.push(result);
                if (result.success) {
                    successfulBatches++;
                }
                else {
                    failedBatches++;
                }
            }
            catch (error) {
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
    async markAsRead(dto, userId) {
        const notifications = await this.notificationRepository.find({
            where: {
                id: (0, typeorm_2.In)(dto.notificationIds),
                user: { id: userId },
            },
        });
        if (notifications.length === 0) {
            throw new common_1.BadRequestException('No notifications found to mark as read');
        }
        await this.notificationRepository.update({ id: (0, typeorm_2.In)(notifications.map(n => n.id)) }, { isRead: true });
        for (const notification of notifications) {
            this.notificationGateway.sendToUser(userId, {
                event: 'notificationRead',
                notificationId: notification.id,
            });
        }
    }
    async getNotifications(filter) {
        const query = this.notificationRepository.createQueryBuilder('notification')
            .leftJoinAndSelect('notification.user', 'user');
        if (filter.type) {
            query.andWhere('notification.type = :type', { type: filter.type });
        }
        if (filter.isRead !== undefined) {
            query.andWhere('notification.isRead = :isRead', { isRead: filter.isRead });
        }
        if (filter.userId) {
            query.andWhere('notification.user.id = :userId', { userId: filter.userId });
        }
        if (filter.search) {
            query.andWhere('(notification.title ILIKE :search OR notification.message ILIKE :search)', { search: `%${filter.search}%` });
        }
        query.orderBy('notification.createdAt', 'DESC');
        const notifications = await query.getMany();
        return notifications.map(n => this.mapToResponseDto(n));
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.count({
            where: {
                user: { id: userId },
                isRead: false,
            },
        });
    }
    async deleteOldNotifications(daysToKeep = 30) {
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
    async getNotificationById(id, userId) {
        const notification = await this.notificationRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!notification) {
            throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
        }
        if (notification.user && notification.user.id !== userId) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user || (user.role !== entity_enum_1.UserRoleEnum.ADMIN && user.role !== entity_enum_1.UserRoleEnum.MANAGER)) {
                throw new common_1.BadRequestException('You do not have permission to view this notification');
            }
        }
        return this.mapToResponseDto(notification);
    }
    async getRecipients(audience, userIds) {
        let query = this.userRepository.createQueryBuilder('user');
        switch (audience) {
            case notification_enum_1.NotificationAudienceEnum.ALL:
                query = query.where('user.isActive = :isActive', { isActive: true });
                break;
            case notification_enum_1.NotificationAudienceEnum.ADMIN:
                query = query.where('user.role IN (:...roles)', {
                    roles: [entity_enum_1.UserRoleEnum.DEV, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.ADMIN],
                });
                break;
            case notification_enum_1.NotificationAudienceEnum.MANAGER:
                query = query.where('user.role IN (:...roles)', {
                    roles: [entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.ADMIN],
                });
                break;
            case notification_enum_1.NotificationAudienceEnum.STAFF:
                query = query.where('user.role IN (:...roles)', {
                    roles: [entity_enum_1.UserRoleEnum.STAFF, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.ADMIN],
                });
                break;
            case notification_enum_1.NotificationAudienceEnum.SPECIFIC_USER:
                if (!userIds || userIds.length === 0) {
                    throw new common_1.BadRequestException('User IDs required for SPECIFIC_USER audience');
                }
                query = query.where('user.id IN (:...userIds)', { userIds });
                break;
        }
        return query.getMany();
    }
    getActionUrl(type, metadata) {
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        switch (type) {
            case notification_enum_1.NotificationEnum.PASSWORD_RESET:
                return `${baseUrl}/reset-password?token=${metadata?.resetToken}`;
            case notification_enum_1.NotificationEnum.ACCOUNT_VERIFIED:
                return `${baseUrl}/login`;
            case notification_enum_1.NotificationEnum.VEHICLE_CREATED:
            case notification_enum_1.NotificationEnum.VEHICLE_UPDATED:
                return `${baseUrl}/vehicles/${metadata?.vehicleId}`;
            case notification_enum_1.NotificationEnum.PART_CREATED:
            case notification_enum_1.NotificationEnum.PART_UPDATED:
                return `${baseUrl}/parts/${metadata?.partId}`;
            case notification_enum_1.NotificationEnum.ORDER_CREATED:
            case notification_enum_1.NotificationEnum.ORDER_UPDATED:
                return `${baseUrl}/orders/${metadata?.orderId}`;
            case notification_enum_1.NotificationEnum.REPORT_READY:
                return `${baseUrl}/reports/${metadata?.reportId}`;
            default:
                return `${baseUrl}/notifications`;
        }
    }
    mapToResponseDto(notification) {
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService,
        notification_gateway_1.NotificationGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map