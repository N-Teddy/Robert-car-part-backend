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
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const notification_entity_1 = require("../../entities/notification.entity");
const user_entity_1 = require("../../entities/user.entity");
const entity_enum_1 = require("../../common/enum/entity.enum");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationRepository, userRepository, configService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationService_1.name);
        this.defaultEmailTemplate = 'generic-notification';
        this.initializeEmailTransport();
        this.registerHandlebarsHelpers();
    }
    initializeEmailTransport() {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('email.host'),
            port: this.configService.get('email.port'),
            secure: this.configService.get('email.secure'),
            auth: this.configService.get('email.secure')
                ? {
                    user: this.configService.get('email.user'),
                    pass: this.configService.get('email.pass'),
                }
                : undefined,
        });
    }
    registerHandlebarsHelpers() {
        Handlebars.registerHelper('formatDate', (date) => {
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(new Date(date));
        });
        Handlebars.registerHelper('uppercase', (str) => {
            return str?.toUpperCase() || '';
        });
        Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
            return arg1 === arg2 ? options.fn(this) : options.inverse(this);
        });
    }
    async createNotification(params) {
        const { type, title, message, metadata = {}, audience = entity_enum_1.NotificationAudienceEnum.ADMINS, sendEmail = false, emailTemplate = this.defaultEmailTemplate, emailContext = {}, createdBy = null } = params;
        try {
            const notification = this.notificationRepository.create({
                type,
                title,
                message,
                metadata,
                audience,
                createdBy,
                isRead: false,
                emailSent: false
            });
            const savedNotification = await this.notificationRepository.save(notification);
            if (sendEmail) {
                this.handleEmailNotificationAsync(savedNotification, emailTemplate, emailContext).catch(error => {
                    this.logger.error('Async email handling failed:', error);
                });
            }
            return savedNotification;
        }
        catch (error) {
            this.logger.error('Failed to create notification', error.stack || String(error));
            throw error;
        }
    }
    async handleEmailNotificationAsync(notification, templateName, emailContext) {
        try {
            const recipients = await this.getAudienceRecipients(notification.audience);
            if (recipients.length === 0) {
                this.logger.warn(`No recipients found for audience: ${notification.audience}`);
                return;
            }
            this.logger.log(`Sending emails to ${recipients.length} recipients`);
            const batchSize = 10;
            for (let i = 0; i < recipients.length; i += batchSize) {
                const batch = recipients.slice(i, i + batchSize);
                await Promise.allSettled(batch.map(recipient => this.sendEmailToRecipient(notification, templateName, emailContext, recipient)));
                if (i + batchSize < recipients.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            await this.notificationRepository.update({ id: notification.id }, { emailSent: true });
            this.logger.log(`Successfully processed emails for notification: ${notification.id}`);
        }
        catch (error) {
            this.logger.error('Failed to handle email notification', error.stack || String(error));
        }
    }
    async sendEmailToRecipient(notification, templateName, emailContext, recipient) {
        try {
            const html = await this.renderEmailTemplate(templateName, {
                ...emailContext,
                title: notification.title,
                message: notification.message,
                notificationType: notification.type,
                recipientName: recipient.fullName || recipient.email,
                recipientEmail: recipient.email,
                notificationId: notification.id
            });
            await this.sendEmail({
                to: recipient.email,
                subject: notification.title,
                html,
            });
            this.logger.debug(`Email sent successfully to: ${recipient.email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${recipient.email}: ${error.message}`);
        }
    }
    async renderEmailTemplate(templateName, context) {
        const templateDir = this.configService.get('email.templateDir') || 'templates/email';
        try {
            const templatePath = path.resolve(templateDir, `${templateName}.hbs`);
            if (fs.existsSync(templatePath)) {
                const templateSrc = fs.readFileSync(templatePath, 'utf8');
                const template = Handlebars.compile(templateSrc);
                return this.wrapInLayout(template(context), context);
            }
            this.logger.warn(`Template ${templateName} not found, using default template`);
            const defaultTemplatePath = path.resolve(templateDir, `${this.defaultEmailTemplate}.hbs`);
            if (fs.existsSync(defaultTemplatePath)) {
                const templateSrc = fs.readFileSync(defaultTemplatePath, 'utf8');
                const template = Handlebars.compile(templateSrc);
                return this.wrapInLayout(template(context), context);
            }
            return this.createBasicEmailHtml(context);
        }
        catch (error) {
            this.logger.error('Failed to render email template, using basic HTML', error);
            return this.createBasicEmailHtml(context);
        }
    }
    wrapInLayout(content, context) {
        const templateDir = this.configService.get('email.templateDir') || 'templates/email';
        const layoutPath = path.resolve(templateDir, 'layout.hbs');
        if (fs.existsSync(layoutPath)) {
            try {
                const layoutSrc = fs.readFileSync(layoutPath, 'utf8');
                const layout = Handlebars.compile(layoutSrc);
                return layout({
                    ...context,
                    title: context.title || 'Notification',
                    body: content
                });
            }
            catch (error) {
                this.logger.warn('Failed to apply layout, using content directly', error);
            }
        }
        return content;
    }
    createBasicEmailHtml(context) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${context.title || 'Notification'}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f4f4f4; padding: 10px; border-radius: 5px; }
            .content { margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${context.title || 'Notification'}</h2>
            </div>
            <div class="content">
              <p>${context.message || 'You have a new notification.'}</p>
              ${context.notificationType ? `<p><strong>Type:</strong> ${context.notificationType}</p>` : ''}
            </div>
          </div>
        </body>
      </html>
    `;
    }
    async getAudienceRecipients(audience) {
        try {
            switch (audience) {
                case entity_enum_1.NotificationAudienceEnum.ADMINS:
                    return await this.userRepository.find({
                        where: {
                            role: (0, typeorm_2.In)([entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.DEV]),
                            isActive: true
                        },
                    });
                case entity_enum_1.NotificationAudienceEnum.ALL_EXCEPT_UNKNOWN:
                    return await this.userRepository.find({
                        where: {
                            role: (0, typeorm_2.In)([
                                entity_enum_1.UserRoleEnum.ADMIN,
                                entity_enum_1.UserRoleEnum.MANAGER,
                                entity_enum_1.UserRoleEnum.DEV,
                                entity_enum_1.UserRoleEnum.SALES,
                                entity_enum_1.UserRoleEnum.CUSTOMER
                            ]),
                            isActive: true
                        },
                    });
                case entity_enum_1.NotificationAudienceEnum.ALL:
                    return await this.userRepository.find({
                        where: { isActive: true }
                    });
                default:
                    this.logger.warn(`Unknown audience type: ${audience}`);
                    return [];
            }
        }
        catch (error) {
            this.logger.error('Failed to get audience recipients', error);
            return [];
        }
    }
    async notifyAdminsOnNewUser(user) {
        try {
            const audience = entity_enum_1.NotificationAudienceEnum.ADMINS;
            const recipients = await this.getAudienceRecipients(audience);
            if (recipients.length === 0) {
                this.logger.warn('No recipients found for notification.');
                return { notified: 0 };
            }
            const title = 'New User Registration - Role Assignment Required';
            const adminPanelUrl = `${this.configService.get('app.frontendUrl')}/admin/users`;
            const notification = this.notificationRepository.create({
                type: entity_enum_1.NotificationEnum.SYSTEM_ALERT,
                title,
                message: `${user.fullName || user.email} registered and is awaiting role assignment.`,
                audience,
            });
            const savedNotification = await this.notificationRepository.save(notification);
            await Promise.all(recipients.map(async (recipient) => {
                try {
                    const html = this.renderTemplate('notify-admin-new-user', {
                        user: {
                            id: user.id,
                            email: user.email,
                            fullName: user.fullName || 'Not provided',
                            createdAt: user.createdAt,
                        },
                        adminPanelUrl,
                        title: 'New User Registration',
                    });
                    await this.sendEmail({
                        to: recipient.email,
                        subject: title,
                        html,
                    });
                }
                catch (error) {
                    this.logger.error(`Failed to email ${recipient.email}: ${error.message}`);
                }
            }));
            savedNotification.emailSent = true;
            await this.notificationRepository.save(savedNotification);
            return { notified: recipients.length };
        }
        catch (error) {
            this.logger.error('Failed to notify admins on new user', error?.stack || String(error));
        }
    }
    async getUserNotifications(userId) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user)
                return [];
            const visibleAudiences = [
                entity_enum_1.NotificationAudienceEnum.ALL,
                entity_enum_1.NotificationAudienceEnum.ALL_EXCEPT_UNKNOWN,
            ];
            if ([
                entity_enum_1.UserRoleEnum.ADMIN,
                entity_enum_1.UserRoleEnum.MANAGER,
                entity_enum_1.UserRoleEnum.DEV,
            ].includes(user.role)) {
                visibleAudiences.push(entity_enum_1.NotificationAudienceEnum.ADMINS);
            }
            return await this.notificationRepository.find({
                where: [
                    { audience: (0, typeorm_2.In)(visibleAudiences) },
                    { user: { id: userId } },
                ],
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getUnreadCount(userId) {
        try {
            const notifications = await this.getUserNotifications(userId);
            const count = notifications.filter((n) => !n.isRead).length;
            return { count };
        }
        catch (error) {
            throw error;
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { id: notificationId },
                relations: ['user'],
                select: {
                    id: true,
                    isRead: true,
                    user: { id: true },
                },
            });
            if (!notification) {
                throw new common_1.NotFoundException('Notification not found');
            }
            if (notification.user && notification.user.id !== userId) {
                throw new common_1.ForbiddenException("Cannot modify others' notifications");
            }
            if (!notification.isRead) {
                await this.notificationRepository.update({ id: notification.id }, { isRead: true });
            }
            return { message: 'Notification marked as read' };
        }
        catch (error) {
            throw error;
        }
    }
    async sendEmail({ to, subject, html, }) {
        try {
            const fromName = this.configService.get('email.defaultFromName');
            const fromEmail = this.configService.get('email.defaultFromEmail');
            const info = await this.transporter.sendMail({
                from: `${fromName} <${fromEmail}>`,
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent: ${info.messageId}`);
            return info;
        }
        catch (error) {
            throw error;
        }
    }
    renderTemplate(templateName, context) {
        try {
            const templateDir = this.configService.get('email.templateDir') ||
                'templates/email';
            const layoutPath = path.resolve(templateDir, 'layout.hbs');
            const templatePath = path.resolve(templateDir, `${templateName}.hbs`);
            const layoutSrc = fs.readFileSync(layoutPath, 'utf8');
            const templateSrc = fs.readFileSync(templatePath, 'utf8');
            const layout = Handlebars.compile(layoutSrc);
            const content = Handlebars.compile(templateSrc)(context);
            return layout({
                title: context.title || 'Car Parts Shop',
                body: content,
            });
        }
        catch (error) {
            throw error;
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map