import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import { NotificationEnum } from '../../common/enum/notification.enum';

interface EmailOptions {
	to: string | string[];
	subject: string;
	template: string;
	context: Record<string, any>;
}

interface RetryOptions {
	maxAttempts?: number;
	delay?: number;
	backoff?: number;
}

@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);
	private transporter: nodemailer.Transporter;
	private templates = new Map<string, handlebars.TemplateDelegate>();
	private readonly defaultRetryOptions: RetryOptions = {
		maxAttempts: 3,
		delay: 1000,
		backoff: 2,
	};
	private readonly isDevelopment: boolean;

	constructor(private readonly configService: ConfigService) {
		this.isDevelopment =
			this.configService.get<string>('NODE_ENV') !== 'production';
		this.initializeTransporter();
		this.loadTemplates();
		this.registerHelpers();
	}

	private initializeTransporter() {
		if (this.isDevelopment) {
			// Use Maildev in development
			this.transporter = nodemailer.createTransport({
				host: 'localhost',
				port: 1025,
				ignoreTLS: true,
				secure: false,
			});
			this.logger.log(
				'Email service configured for development (Maildev)'
			);
		} else {
			// Use real SMTP in production
			this.transporter = nodemailer.createTransport({
				host: this.configService.get<string>('SMTP_HOST'),
				port: this.configService.get<number>('SMTP_PORT'),
				secure: this.configService.get<boolean>('SMTP_SECURE'),
				auth: {
					user: this.configService.get<string>('SMTP_USER'),
					pass: this.configService.get<string>('SMTP_PASS'),
				},
			});
			this.logger.log('Email service configured for production');
		}

		// Verify transporter configuration
		this.transporter.verify((error) => {
			if (error) {
				this.logger.error(
					'Email transporter verification failed:',
					error
				);
			} else {
				this.logger.log('Email transporter is ready');
			}
		});
	}

	private registerHelpers() {
		// Register common Handlebars helpers
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

	private async loadTemplates() {
		try {
			const templatesDir = path.join(process.cwd(), 'templates', 'email');
			const files = await fs.readdir(templatesDir);

			// Load layout template
			const layoutPath = path.join(templatesDir, 'layout.hbs');
			try {
				const layoutContent = await fs.readFile(layoutPath, 'utf-8');
				handlebars.registerPartial('layout', layoutContent);
			} catch (error) {
				this.logger.warn(
					'No layout template found, using templates without layout'
				);
			}

			// Load all template files
			for (const file of files) {
				if (file.endsWith('.hbs') && file !== 'layout.hbs') {
					const templateName = file.replace('.hbs', '');
					const templatePath = path.join(templatesDir, file);
					const templateContent = await fs.readFile(
						templatePath,
						'utf-8'
					);
					const compiledTemplate =
						handlebars.compile(templateContent);
					this.templates.set(templateName, compiledTemplate);
				}
			}

			this.logger.log(`Loaded ${this.templates.size} email templates`);
		} catch (error) {
			this.logger.error('Failed to load email templates', error);
		}
	}

	async sendEmail(
		options: EmailOptions,
		retryOptions?: RetryOptions
	): Promise<boolean> {
		const retry = { ...this.defaultRetryOptions, ...retryOptions };
		let lastError: Error;
		let delay = retry.delay!;

		for (let attempt = 1; attempt <= retry.maxAttempts!; attempt++) {
			try {
				const template = this.templates.get(options.template);
				if (!template) {
					// If template not found, use a default template
					this.logger.warn(
						`Template ${options.template} not found, using default`
					);
					const defaultTemplate = this.templates.get('default');
					if (!defaultTemplate) {
						throw new Error(
							`Template ${options.template} not found and no default template available`
						);
					}
				}

				const html = template
					? template(options.context)
					: this.generateDefaultHtml(options.context);

				const mailOptions = {
					from: `${this.configService.get<string>('DEFAULT_FROM_NAME')} <${this.configService.get<string>('DEFAULT_FROM_EMAIL')}>`,
					to: Array.isArray(options.to)
						? options.to.join(', ')
						: options.to,
					subject: options.subject,
					html,
				};

				const info = await this.transporter.sendMail(mailOptions);

				this.logger.log(`Email sent successfully: ${info.messageId}`);
				if (this.isDevelopment) {
					this.logger.debug(
						`Preview URL: ${nodemailer.getTestMessageUrl(info)}`
					);
				}

				return true;
			} catch (error) {
				lastError = error as Error;
				this.logger.error(
					`Email send attempt ${attempt} failed:`,
					error
				);

				if (attempt < retry.maxAttempts!) {
					this.logger.log(`Retrying in ${delay}ms...`);
					await this.sleep(delay);
					delay *= retry.backoff!; // Exponential backoff
				}
			}
		}

		this.logger.error(
			`Failed to send email after ${retry.maxAttempts} attempts:`,
			lastError!
		);
		return false;
	}

	async sendBulkEmails(
		recipients: string[],
		subject: string,
		template: string,
		context: Record<string, any>,
		retryOptions?: RetryOptions
	): Promise<{ sent: string[]; failed: string[] }> {
		const sent: string[] = [];
		const failed: string[] = [];

		// Send emails in batches to avoid overwhelming the server
		const batchSize = 10;
		for (let i = 0; i < recipients.length; i += batchSize) {
			const batch = recipients.slice(i, i + batchSize);

			await Promise.all(
				batch.map(async (recipient) => {
					const success = await this.sendEmail(
						{
							to: recipient,
							subject,
							template,
							context: { ...context, recipient },
						},
						retryOptions
					);

					if (success) {
						sent.push(recipient);
					} else {
						failed.push(recipient);
					}
				})
			);

			// Add a small delay between batches
			if (i + batchSize < recipients.length) {
				await this.sleep(500);
			}
		}

		return { sent, failed };
	}

	private generateDefaultHtml(context: Record<string, any>): string {
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

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// Template-specific methods
	getTemplateForNotificationType(type: NotificationEnum): string {
		const templateMap: Record<NotificationEnum, string> = {
			[NotificationEnum.WELCOME]: 'welcome-pending-role',
			[NotificationEnum.PASSWORD_RESET]: 'password-reset',
			[NotificationEnum.PASSWORD_CHANGED]: 'password-change-confirm',
			[NotificationEnum.ACCOUNT_VERIFIED]: 'account-verified',
			[NotificationEnum.ROLE_ASSIGNED]: 'role-assigned',
			[NotificationEnum.VEHICLE_CREATED]: 'notify-vehicle-created',
			[NotificationEnum.VEHICLE_UPDATED]: 'notify-vehicle-updated',
			[NotificationEnum.VEHICLE_DELETED]: 'notify-vehicle-deleted',
			[NotificationEnum.VEHICLE_PARTED_OUT]: 'notify-vehicle-parted-out',
			[NotificationEnum.PART_CREATED]: 'part-created',
			[NotificationEnum.PART_UPDATED]: 'part-updated',
			[NotificationEnum.PART_DELETED]: 'part-deleted',
			[NotificationEnum.PART_SOLD]: 'part-sold',
			[NotificationEnum.PART_LOW_STOCK]: 'part-low-stock',
			[NotificationEnum.ORDER_CREATED]: 'order-created',
			[NotificationEnum.ORDER_UPDATED]: 'order-updated',
			[NotificationEnum.ORDER_COMPLETED]: 'order-completed',
			[NotificationEnum.ORDER_CANCELLED]: 'order-cancelled',
			[NotificationEnum.REPORT_GENERATED]: 'report-generated',
			[NotificationEnum.REPORT_READY]: 'report-ready',
			[NotificationEnum.SYSTEM_MAINTENANCE]: 'system-maintenance',
			[NotificationEnum.SYSTEM_UPDATE]: 'system-update',
			[NotificationEnum.PROFILE_UPDATED]: '',
			[NotificationEnum.USER_UPDATED]: '',
			[NotificationEnum.USER_DELETED]: '',
			[NotificationEnum.CATEGORY_CREATED]: '',
			[NotificationEnum.CATEGORY_UPDATED]: '',
			[NotificationEnum.CATEGORY_DELETED]: '',
			[NotificationEnum.REORDER_CATEGORIES]: '',
		};

		return templateMap[type] || 'default';
	}
}
