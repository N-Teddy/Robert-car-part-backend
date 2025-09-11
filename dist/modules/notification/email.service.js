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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs/promises");
const path = require("path");
const notification_enum_1 = require("../../common/enum/notification.enum");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.templates = new Map();
        this.defaultRetryOptions = {
            maxAttempts: 3,
            delay: 1000,
            backoff: 2,
        };
        this.isDevelopment =
            this.configService.get('NODE_ENV') !== 'production';
        this.initializeTransporter();
        this.loadTemplates();
        this.registerHelpers();
    }
    initializeTransporter() {
        if (this.isDevelopment) {
            this.transporter = nodemailer.createTransport({
                host: 'localhost',
                port: 1025,
                ignoreTLS: true,
                secure: false,
            });
            this.logger.log('Email service configured for development (Maildev)');
        }
        else {
            this.transporter = nodemailer.createTransport({
                host: this.configService.get('SMTP_HOST'),
                port: this.configService.get('SMTP_PORT'),
                secure: this.configService.get('SMTP_SECURE'),
                auth: {
                    user: this.configService.get('SMTP_USER'),
                    pass: this.configService.get('SMTP_PASS'),
                },
            });
            this.logger.log('Email service configured for production');
        }
        this.transporter.verify((error) => {
            if (error) {
                this.logger.error('Email transporter verification failed:', error);
            }
            else {
                this.logger.log('Email transporter is ready');
            }
        });
    }
    registerHelpers() {
        handlebars.registerHelper('eq', (a, b) => a === b);
        handlebars.registerHelper('ne', (a, b) => a !== b);
        handlebars.registerHelper('lt', (a, b) => a < b);
        handlebars.registerHelper('gt', (a, b) => a > b);
        handlebars.registerHelper('lte', (a, b) => a <= b);
        handlebars.registerHelper('gte', (a, b) => a >= b);
        handlebars.registerHelper('and', (a, b) => a && b);
        handlebars.registerHelper('or', (a, b) => a || b);
        handlebars.registerHelper('formatDate', (date) => {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        });
        handlebars.registerHelper('formatTime', (date) => {
            return new Date(date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        });
    }
    async loadTemplates() {
        try {
            const templatesDir = path.join(process.cwd(), 'templates', 'email');
            const files = await fs.readdir(templatesDir);
            const layoutPath = path.join(templatesDir, 'layout.hbs');
            try {
                const layoutContent = await fs.readFile(layoutPath, 'utf-8');
                handlebars.registerPartial('layout', layoutContent);
            }
            catch (error) {
                this.logger.warn('No layout template found, using templates without layout');
            }
            for (const file of files) {
                if (file.endsWith('.hbs') && file !== 'layout.hbs') {
                    const templateName = file.replace('.hbs', '');
                    const templatePath = path.join(templatesDir, file);
                    const templateContent = await fs.readFile(templatePath, 'utf-8');
                    const compiledTemplate = handlebars.compile(templateContent);
                    this.templates.set(templateName, compiledTemplate);
                }
            }
            this.logger.log(`Loaded ${this.templates.size} email templates`);
        }
        catch (error) {
            this.logger.error('Failed to load email templates', error);
        }
    }
    async sendEmail(options, retryOptions) {
        const retry = { ...this.defaultRetryOptions, ...retryOptions };
        let lastError;
        let delay = retry.delay;
        for (let attempt = 1; attempt <= retry.maxAttempts; attempt++) {
            try {
                const template = this.templates.get(options.template);
                if (!template) {
                    this.logger.warn(`Template ${options.template} not found, using default`);
                    const defaultTemplate = this.templates.get('default');
                    if (!defaultTemplate) {
                        throw new Error(`Template ${options.template} not found and no default template available`);
                    }
                }
                const html = template
                    ? template(options.context)
                    : this.generateDefaultHtml(options.context);
                const mailOptions = {
                    from: `${this.configService.get('DEFAULT_FROM_NAME')} <${this.configService.get('DEFAULT_FROM_EMAIL')}>`,
                    to: Array.isArray(options.to)
                        ? options.to.join(', ')
                        : options.to,
                    subject: options.subject,
                    html,
                };
                const info = await this.transporter.sendMail(mailOptions);
                this.logger.log(`Email sent successfully: ${info.messageId}`);
                if (this.isDevelopment) {
                    this.logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
                }
                return true;
            }
            catch (error) {
                lastError = error;
                this.logger.error(`Email send attempt ${attempt} failed:`, error);
                if (attempt < retry.maxAttempts) {
                    this.logger.log(`Retrying in ${delay}ms...`);
                    await this.sleep(delay);
                    delay *= retry.backoff;
                }
            }
        }
        this.logger.error(`Failed to send email after ${retry.maxAttempts} attempts:`, lastError);
        return false;
    }
    async sendBulkEmails(recipients, subject, template, context, retryOptions) {
        const sent = [];
        const failed = [];
        const batchSize = 10;
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            await Promise.all(batch.map(async (recipient) => {
                const success = await this.sendEmail({
                    to: recipient,
                    subject,
                    template,
                    context: { ...context, recipient },
                }, retryOptions);
                if (success) {
                    sent.push(recipient);
                }
                else {
                    failed.push(recipient);
                }
            }));
            if (i + batchSize < recipients.length) {
                await this.sleep(500);
            }
        }
        return { sent, failed };
    }
    generateDefaultHtml(context) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${context.title || 'Notification'}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>${context.title || 'Notification'}</h2>
            <p>${context.message || ''}</p>
            ${context.metadata ? `<pre>${JSON.stringify(context.metadata, null, 2)}</pre>` : ''}
          </div>
        </body>
      </html>
    `;
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    getTemplateForNotificationType(type) {
        const templateMap = {
            [notification_enum_1.NotificationEnum.WELCOME]: 'welcome-pending-role',
            [notification_enum_1.NotificationEnum.PASSWORD_RESET]: 'password-reset',
            [notification_enum_1.NotificationEnum.PASSWORD_CHANGED]: 'password-change-confirm',
            [notification_enum_1.NotificationEnum.ACCOUNT_VERIFIED]: 'account-verified',
            [notification_enum_1.NotificationEnum.ROLE_ASSIGNED]: 'role-assigned',
            [notification_enum_1.NotificationEnum.VEHICLE_CREATED]: 'notify-vehicle-created',
            [notification_enum_1.NotificationEnum.VEHICLE_UPDATED]: 'notify-vehicle-updated',
            [notification_enum_1.NotificationEnum.VEHICLE_DELETED]: 'notify-vehicle-deleted',
            [notification_enum_1.NotificationEnum.VEHICLE_PARTED_OUT]: 'notify-vehicle-parted-out',
            [notification_enum_1.NotificationEnum.PART_CREATED]: 'part-created',
            [notification_enum_1.NotificationEnum.PART_UPDATED]: 'part-updated',
            [notification_enum_1.NotificationEnum.PART_SOLD]: 'part-sold',
            [notification_enum_1.NotificationEnum.PART_LOW_STOCK]: 'part-low-stock',
            [notification_enum_1.NotificationEnum.ORDER_CREATED]: 'order-created',
            [notification_enum_1.NotificationEnum.ORDER_UPDATED]: 'order-updated',
            [notification_enum_1.NotificationEnum.ORDER_COMPLETED]: 'order-completed',
            [notification_enum_1.NotificationEnum.ORDER_CANCELLED]: 'order-cancelled',
            [notification_enum_1.NotificationEnum.REPORT_GENERATED]: 'report-generated',
            [notification_enum_1.NotificationEnum.REPORT_READY]: 'report-ready',
            [notification_enum_1.NotificationEnum.SYSTEM_MAINTENANCE]: 'system-maintenance',
            [notification_enum_1.NotificationEnum.SYSTEM_UPDATE]: 'system-update',
            [notification_enum_1.NotificationEnum.PROFILE_UPDATED]: '',
            [notification_enum_1.NotificationEnum.USER_UPDATED]: '',
            [notification_enum_1.NotificationEnum.USER_DELETED]: '',
        };
        return templateMap[type] || 'default';
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map