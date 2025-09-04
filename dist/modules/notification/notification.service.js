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
const event_emitter_1 = require("@nestjs/event-emitter");
const bull_1 = require("@nestjs/bull");
const schedule_1 = require("@nestjs/schedule");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const config_1 = require("@nestjs/config");
const notification_entity_1 = require("../../entities/notification.entity");
const user_entity_1 = require("../../entities/user.entity");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const notification_gateway_1 = require("./notification.gateway");
const notification_enum_1 = require("../../common/enum/notification.enum");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationRepository, userRepository, notificationQueue, configService, eventEmitter, auditLogService, notificationGateway) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationQueue = notificationQueue;
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.auditLogService = auditLogService;
        this.notificationGateway = notificationGateway;
        this.logger = new common_1.Logger(NotificationService_1.name);
        this.emailTemplates = new Map();
        this.retryInterval = 60000;
        this.initializeEmailTransporter();
        this.loadEmailTemplates();
    }
    initializeEmailTransporter() {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: this.configService.get('SMTP_SECURE') === 'true',
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }
    loadEmailTemplates() {
        const templateDir = path.join(process.cwd(), 'templates', 'email');
        try {
            const layoutPath = path.join(templateDir, 'layout.hbs');
            if (fs.existsSync(layoutPath)) {
                const layoutTemplate = fs.readFileSync(layoutPath, 'utf-8');
                handlebars.registerPartial('layout', layoutTemplate);
            }
            const templateFiles = fs.readdirSync(templateDir);
            templateFiles.forEach(file => {
                if (file !== 'layout.hbs' && file.endsWith('.hbs')) {
                    const templateName = file.replace('.hbs', '');
                    const templatePath = path.join(templateDir, file);
                    const templateContent = fs.readFileSync(templatePath, 'utf-8');
                    const compiledTemplate = handlebars.compile(templateContent);
                    this.emailTemplates.set(templateName, compiledTemplate);
                }
            });
        }
        catch (error) {
            this.logger.error('Failed to load email templates', error);
        }
    }
    async createNotification(dto) {
        const user = await this.userRepository.findOne({ where: { id: dto.userId } });
        if (!user) {
            throw new Error('User not found');
        }
        if (!this.shouldSendNotification(user, dto.type, dto.channel)) {
            this.logger.log(`User ${user.id} has disabled ${dto.channel} notifications for type ${dto.type}`);
            return null;
        }
        const notification = this.notificationRepository.create({
            ...dto,
            user,
            status: notification_enum_1.NotificationStatus.PENDING,
            priority: dto.priority || notification_enum_1.NotificationPriority.MEDIUM,
        });
        const savedNotification = await this.notificationRepository.save(notification);
        await this.queueNotification(savedNotification);
        return savedNotification;
    }
    shouldSendNotification(user, type, channel) {
        const preferences = user.notificationPreferences || {};
        if (channel === notification_enum_1.NotificationChannel.EMAIL) {
            const emailPrefs = preferences.email;
            if (!emailPrefs?.enabled)
                return false;
            if (emailPrefs.types && !emailPrefs.types.includes(type))
                return false;
        }
        if (channel === notification_enum_1.NotificationChannel.IN_APP) {
            const inAppPrefs = preferences.inApp;
            if (inAppPrefs && !inAppPrefs.enabled)
                return false;
            if (inAppPrefs?.types && !inAppPrefs.types.includes(type))
                return false;
        }
        return true;
    }
    async queueNotification(notification) {
        const delay = this.getDelayForPriority(notification.priority);
        await this.notificationQueue.add('process-notification', { notificationId: notification.id }, {
            delay,
            attempts: notification.maxRetries,
            backoff: {
                type: 'fixed',
                delay: this.retryInterval,
            },
        });
        await this.notificationRepository.update(notification.id, {
            status: notification_enum_1.NotificationStatus.QUEUED,
        });
    }
    getDelayForPriority(priority) {
        switch (priority) {
            case notification_enum_1.NotificationPriority.CRITICAL:
                return 0;
            case notification_enum_1.NotificationPriority.HIGH:
                return 1000;
            case notification_enum_1.NotificationPriority.MEDIUM:
                return 5000;
            case notification_enum_1.NotificationPriority.LOW:
                return 30000;
            default:
                return 5000;
        }
    }
    async processNotification(notificationId) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId },
            relations: ['user'],
        });
        if (!notification) {
            this.logger.error(`Notification ${notificationId} not found`);
            return;
        }
        try {
            await this.notificationRepository.update(notification.id, {
                status: notification_enum_1.NotificationStatus.PROCESSING,
            });
            if (notification.channel === notification_enum_1.NotificationChannel.EMAIL) {
                await this.sendEmailNotification(notification);
            }
            else if (notification.channel === notification_enum_1.NotificationChannel.IN_APP) {
                await this.sendInAppNotification(notification);
            }
            await this.notificationRepository.update(notification.id, {
                status: notification_enum_1.NotificationStatus.SENT,
                sentAt: new Date(),
            });
        }
        catch (error) {
            await this.handleNotificationError(notification, error);
        }
    }
    async sendEmailNotification(notification) {
        const template = this.getEmailTemplate(notification.type);
        if (!template) {
            throw new Error(`Email template not found for type: ${notification.type}`);
        }
        const html = template({
            user: notification.user,
            ...notification.payload,
        });
        const mailOptions = {
            from: `${this.configService.get('DEFAULT_FROM_NAME')} <${this.configService.get('DEFAULT_FROM_EMAIL')}>`,
            to: notification.user.email,
            subject: notification.title,
            html,
        };
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`Email sent to ${notification.user.email} for notification ${notification.id}`);
    }
    async sendInAppNotification(notification) {
        this.notificationGateway.sendNotificationToUser(notification.userId, {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            content: notification.content,
            priority: notification.priority,
            createdAt: notification.createdAt,
        });
        await this.notificationRepository.update(notification.id, {
            status: notification_enum_1.NotificationStatus.DELIVERED,
            deliveredAt: new Date(),
        });
    }
    async handleNotificationError(notification, error) {
        const errorMessage = error.message || 'Unknown error';
        if (notification.retryCount < notification.maxRetries) {
            const nextRetryAt = new Date(Date.now() + this.retryInterval);
            await this.notificationRepository.update(notification.id, {
                status: notification_enum_1.NotificationStatus.RETRY,
                retryCount: notification.retryCount + 1,
                nextRetryAt,
                errorMessage,
            });
            await this.notificationQueue.add('process-notification', { notificationId: notification.id }, { delay: this.retryInterval });
        }
        else {
            await this.notificationRepository.update(notification.id, {
                status: notification_enum_1.NotificationStatus.FAILED,
                failedAt: new Date(),
                errorMessage,
            });
        }
        this.logger.error(`Failed to send notification ${notification.id}: ${errorMessage}`);
    }
    getEmailTemplate(type) {
        const templateMap = {
            [notification_enum_1.NotificationType.WELCOME]: 'welcome-pending-role',
            [notification_enum_1.NotificationType.PASSWORD_RESET]: 'password-reset',
            [notification_enum_1.NotificationType.PASSWORD_CHANGED]: 'password-change-confirm',
            [notification_enum_1.NotificationType.ROLE_ASSIGNED]: 'role-assigned',
            [notification_enum_1.NotificationType.VEHICLE_CREATED]: 'notify-vehicle-created',
            [notification_enum_1.NotificationType.VEHICLE_UPDATED]: 'notify-vehicle-updated',
            [notification_enum_1.NotificationType.VEHICLE_DELETED]: 'notify-vehicle-deleted',
            [notification_enum_1.NotificationType.VEHICLE_PARTED_OUT]: 'notify-vehicle-parted-out',
            [notification_enum_1.NotificationType.NEW_DEVICE_LOGIN]: 'new_device_login',
            [notification_enum_1.NotificationType.PROFILE_UPDATED]: 'profile_updated',
            [notification_enum_1.NotificationType.ACCOUNT_ACTIVATED]: 'account_activated',
            [notification_enum_1.NotificationType.ACCOUNT_DEACTIVATED]: 'account_deactivated',
            [notification_enum_1.NotificationType.EMAIL_VERIFICATION]: 'email_verification',
            [notification_enum_1.NotificationType.NEW_CATEGORY]: 'new_category',
            [notification_enum_1.NotificationType.CATEGORY_UPDATED]: 'category_updated',
            [notification_enum_1.NotificationType.SYSTEM_ANNOUNCEMENT]: 'system_announcement',
        };
        const templateName = templateMap[type];
        return templateName ? this.emailTemplates.get(templateName) : null;
    }
    async getUserNotifications(userId, query) {
        const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
            .where('notification.userId = :userId', { userId })
            .orderBy('notification.createdAt', 'DESC');
        if (query.status) {
            queryBuilder.andWhere('notification.status = :status', { status: query.status });
        }
        if (query.type) {
            queryBuilder.andWhere('notification.type = :type', { type: query.type });
        }
        const [notifications, total] = await queryBuilder
            .skip(query.offset || 0)
            .take(query.limit || 20)
            .getManyAndCount();
        return { notifications, total };
    }
    async markAsRead(userId, notificationId) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new Error('Notification not found');
        }
        notification.status = notification_enum_1.NotificationStatus.READ;
        notification.readAt = new Date();
        const updated = await this.notificationRepository.save(notification);
        await this.userRepository.update(userId, {
            lastNotificationReadAt: new Date(),
        });
        return updated;
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.update({
            userId,
            status: (0, typeorm_2.Not)(notification_enum_1.NotificationStatus.READ),
            channel: notification_enum_1.NotificationChannel.IN_APP,
        }, {
            status: notification_enum_1.NotificationStatus.READ,
            readAt: new Date(),
        });
        await this.userRepository.update(userId, {
            lastNotificationReadAt: new Date(),
        });
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.count({
            where: {
                userId,
                status: (0, typeorm_2.Not)(notification_enum_1.NotificationStatus.READ),
                channel: notification_enum_1.NotificationChannel.IN_APP,
            },
        });
    }
    async updateUserPreferences(userId, preferences) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        user.notificationPreferences = {
            ...user.notificationPreferences,
            ...preferences,
        };
        return this.userRepository.save(user);
    }
    async cleanupOldNotifications() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const result = await this.notificationRepository.delete({
            createdAt: (0, typeorm_2.LessThan)(thirtyDaysAgo),
            status: (0, typeorm_2.In)([notification_enum_1.NotificationStatus.READ, notification_enum_1.NotificationStatus.FAILED]),
        });
        this.logger.log(`Cleaned up ${result.affected} old notifications`);
    }
    async handleUserRegistered(payload) {
        await this.createNotification({
            userId: payload.userId,
            type: notification_enum_1.NotificationType.WELCOME,
            channel: notification_enum_1.NotificationChannel.EMAIL,
            priority: notification_enum_1.NotificationPriority.HIGH,
            title: 'Welcome to Car Parts Shop!',
            content: `Welcome ${payload.name}! Your account has been created successfully.`,
            payload: {
                name: payload.name,
                email: payload.email,
            },
        });
    }
    async handlePasswordResetRequested(payload) {
        const user = await this.userRepository.findOne({ where: { id: payload.userId } });
        await this.createNotification({
            userId: payload.userId,
            type: notification_enum_1.NotificationType.PASSWORD_RESET,
            channel: notification_enum_1.NotificationChannel.EMAIL,
            priority: notification_enum_1.NotificationPriority.CRITICAL,
            title: 'Password Reset Request',
            content: 'You have requested to reset your password.',
            payload: {
                resetLink: `${this.configService.get('FRONTEND_URL')}/reset-password?token=${payload.resetToken}`,
                userName: user.fullName,
            },
        });
    }
    async handlePasswordChanged(payload) {
        await this.createNotification({
            userId: payload.userId,
            type: notification_enum_1.NotificationType.PASSWORD_CHANGED,
            channel: notification_enum_1.NotificationChannel.EMAIL,
            priority: notification_enum_1.NotificationPriority.HIGH,
            title: 'Password Changed Successfully',
            content: 'Your password has been changed successfully.',
            payload: {},
        });
        await this.createNotification({
            userId: payload.userId,
            type: notification_enum_1.NotificationType.PASSWORD_CHANGED,
            channel: notification_enum_1.NotificationChannel.IN_APP,
            priority: notification_enum_1.NotificationPriority.HIGH,
            title: 'Password Changed',
            content: 'Your password has been updated.',
            payload: {},
        });
    }
    async handleRoleAssigned(payload) {
        await this.createNotification({
            userId: payload.userId,
            type: notification_enum_1.NotificationType.ROLE_ASSIGNED,
            channel: notification_enum_1.NotificationChannel.EMAIL,
            priority: notification_enum_1.NotificationPriority.HIGH,
            title: 'Role Assigned',
            content: `You have been assigned the role: ${payload.role}`,
            payload: { role: payload.role },
        });
    }
    async handleVehicleCreated(payload) {
        await this.createNotification({
            userId: payload.userId,
            type: notification_enum_1.NotificationType.VEHICLE_CREATED,
            channel: notification_enum_1.NotificationChannel.IN_APP,
            priority: notification_enum_1.NotificationPriority.MEDIUM,
            title: 'Vehicle Listed Successfully',
            content: `Your vehicle "${payload.vehicleName}" has been listed.`,
            payload: { vehicleId: payload.vehicleId, vehicleName: payload.vehicleName },
        });
    }
    async handleVehicleUpdated(payload) {
        await this.createNotification({
            userId: payload.userId,
            type: notification_enum_1.NotificationType.VEHICLE_UPDATED,
            channel: notification_enum_1.NotificationChannel.IN_APP,
            priority: notification_enum_1.NotificationPriority.LOW,
            title: 'Vehicle Updated',
            content: `Your vehicle "${payload.vehicleName}" has been updated.`,
            payload: { vehicleId: payload.vehicleId, vehicleName: payload.vehicleName },
        });
    }
    async handleVehicleDeleted(payload) {
        await this.createNotification({
            userId: payload.userId,
            type: notification_enum_1.NotificationType.VEHICLE_DELETED,
            channel: notification_enum_1.NotificationChannel.EMAIL,
            priority: notification_enum_1.NotificationPriority.MEDIUM,
            title: 'Vehicle Deleted',
            content: `Your vehicle "${payload.vehicleName}" has been removed from listings.`,
            payload: { vehicleName: payload.vehicleName },
        });
    }
    async handleVehiclePartedOut(payload) {
        await this.createNotification({
            userId: payload.userId,
            type: notification_enum_1.NotificationType.VEHICLE_PARTED_OUT,
            channel: notification_enum_1.NotificationChannel.EMAIL,
            priority: notification_enum_1.NotificationPriority.HIGH,
            title: 'Vehicle Parted Out',
            content: `Your vehicle "${payload.vehicleName}" has been successfully parted out.`,
            payload: { vehicleId: payload.vehicleId, vehicleName: payload.vehicleName },
        });
    }
};
exports.NotificationService = NotificationService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "cleanupOldNotifications", null);
__decorate([
    (0, event_emitter_1.OnEvent)('user.registered'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleUserRegistered", null);
__decorate([
    (0, event_emitter_1.OnEvent)('password.reset.requested'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handlePasswordResetRequested", null);
__decorate([
    (0, event_emitter_1.OnEvent)('password.changed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handlePasswordChanged", null);
__decorate([
    (0, event_emitter_1.OnEvent)('role.assigned'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleRoleAssigned", null);
__decorate([
    (0, event_emitter_1.OnEvent)('vehicle.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleVehicleCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('vehicle.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleVehicleUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('vehicle.deleted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleVehicleDeleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)('vehicle.parted.out'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleVehiclePartedOut", null);
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, bull_1.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, Object, config_1.ConfigService,
        event_emitter_1.EventEmitter2,
        audit_log_service_1.AuditLogService,
        notification_gateway_1.NotificationGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map