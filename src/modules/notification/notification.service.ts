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

interface CreateNotificationParams {
	type: NotificationEnum;
	title: string;
	message: string;
	metadata?: Record<string, any>;
	audience?: NotificationAudienceEnum;
	sendEmail?: boolean;
	emailTemplate?: string;
	emailContext?: Record<string, any>;
	createdBy?: string | null;
}

@Injectable()
export class NotificationService {

	private readonly logger = new Logger(NotificationService.name);
	private transporter: nodemailer.Transporter;
	private readonly defaultEmailTemplate = 'generic-notification';

	constructor(
		@InjectRepository(Notification)
		private readonly notificationRepository: Repository<Notification>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly configService: ConfigService
	) {
		this.initializeEmailTransport();
		this.registerHandlebarsHelpers();
	}

// 	// Simple admin notification
// await notificationService.createNotification({
// 	type: NotificationEnum.SYSTEM_ALERT,
// 	title: 'System Update',
// 	message: 'System will be updated tonight at 2 AM',
// 	audience: NotificationAudienceEnum.ADMINS,
// 	createdBy: currentUserId
// });

// // Notification with email to all active users
// await notificationService.createNotification({
// 	type: NotificationEnum.ORDER_CREATED,
// 	title: 'New Feature Released',
// 	message: 'Check out our latest features in the dashboard',
// 	audience: NotificationAudienceEnum.ALL_EXCEPT_UNKNOWN,
// 	sendEmail: true,
// 	emailTemplate: 'feature-release',
// 	emailContext: { featureName: 'Advanced Analytics', releaseDate: new Date() },
// 	createdBy: systemUserId
// });

// // Low stock alert with metadata
// await notificationService.createNotification({
// 	type: NotificationEnum.LOW_STOCK,
// 	title: 'Inventory Low',
// 	message: 'Product XYZ stock is critically low',
// 	metadata: { productId: '123', currentStock: 2, threshold: 10 },
// 	audience: NotificationAudienceEnum.ADMINS,
// 	sendEmail: true,
// 	createdBy: inventorySystemId
// });


	private initializeEmailTransport() {
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
	}

	private registerHandlebarsHelpers() {
		Handlebars.registerHelper('formatDate', (date: Date) => {
			return new Intl.DateTimeFormat('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			}).format(new Date(date));
		});

		// Additional helpful helpers
		Handlebars.registerHelper('uppercase', (str: string) => {
			return str?.toUpperCase() || '';
		});

		Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
			return arg1 === arg2 ? options.fn(this) : options.inverse(this);
		});
	}

	/**
 * Single service function to create notifications with optional email sending
 */
	async createNotification(params: CreateNotificationParams): Promise<Notification> {
		const {
			type,
			title,
			message,
			metadata = {},
			audience = NotificationAudienceEnum.ADMINS,
			sendEmail = false,
			emailTemplate = this.defaultEmailTemplate,
			emailContext = {},
			createdBy = null
		} = params;

		try {
			// Create and save the notification
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

			// Handle email sending asynchronously to not block the main operation
			if (sendEmail) {
				this.handleEmailNotificationAsync(
					savedNotification,
					emailTemplate,
					emailContext
				).catch(error => {
					this.logger.error('Async email handling failed:', error);
				});
			}

			return savedNotification;
		} catch (error) {
			this.logger.error('Failed to create notification', error.stack || String(error));
			throw error;
		}
	}

	/**
	 * Handle email notification asynchronously
	 */
	private async handleEmailNotificationAsync(
		notification: Notification,
		templateName: string,
		emailContext: Record<string, any>
	): Promise<void> {
		try {
			const recipients = await this.getAudienceRecipients(notification.audience);

			if (recipients.length === 0) {
				this.logger.warn(`No recipients found for audience: ${notification.audience}`);
				return;
			}

			this.logger.log(`Sending emails to ${recipients.length} recipients`);

			// Process emails in batches to avoid overwhelming the email service
			const batchSize = 10;
			for (let i = 0; i < recipients.length; i += batchSize) {
				const batch = recipients.slice(i, i + batchSize);

				await Promise.allSettled(
					batch.map(recipient =>
						this.sendEmailToRecipient(notification, templateName, emailContext, recipient)
					)
				);

				// Small delay between batches to be gentle on the email service
				if (i + batchSize < recipients.length) {
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			}

			// Update notification email status
			await this.notificationRepository.update(
				{ id: notification.id },
				{ emailSent: true }
			);

			this.logger.log(`Successfully processed emails for notification: ${notification.id}`);

		} catch (error) {
			this.logger.error('Failed to handle email notification', error.stack || String(error));
		}
	}

	/**
	 * Send email to individual recipient with proper error handling
	 */
	private async sendEmailToRecipient(
		notification: Notification,
		templateName: string,
		emailContext: Record<string, any>,
		recipient: User
	): Promise<void> {
		try {
			const html = await this.renderEmailTemplate(
				templateName,
				{
					...emailContext,
					title: notification.title,
					message: notification.message,
					notificationType: notification.type,
					recipientName: recipient.fullName || recipient.email,
					recipientEmail: recipient.email,
					notificationId: notification.id
				}
			);

			await this.sendEmail({
				to: recipient.email,
				subject: notification.title,
				html,
			});

			this.logger.debug(`Email sent successfully to: ${recipient.email}`);

		} catch (error) {
			this.logger.error(
				`Failed to send email to ${recipient.email}: ${error.message}`
			);
			// Don't throw - continue with other recipients
		}
	}

	/**
	 * Render email template with fallback mechanism
	 */
	private async renderEmailTemplate(
		templateName: string,
		context: any
	): Promise<string> {
		const templateDir = this.configService.get<string>('email.templateDir') || 'templates/email';

		try {
			// Try the specified template first
			const templatePath = path.resolve(templateDir, `${templateName}.hbs`);
			if (fs.existsSync(templatePath)) {
				const templateSrc = fs.readFileSync(templatePath, 'utf8');
				const template = Handlebars.compile(templateSrc);
				return this.wrapInLayout(template(context), context);
			}

			// Fallback to default template
			this.logger.warn(`Template ${templateName} not found, using default template`);
			const defaultTemplatePath = path.resolve(templateDir, `${this.defaultEmailTemplate}.hbs`);

			if (fs.existsSync(defaultTemplatePath)) {
				const templateSrc = fs.readFileSync(defaultTemplatePath, 'utf8');
				const template = Handlebars.compile(templateSrc);
				return this.wrapInLayout(template(context), context);
			}

			// Ultimate fallback - basic HTML
			return this.createBasicEmailHtml(context);

		} catch (error) {
			this.logger.error('Failed to render email template, using basic HTML', error);
			return this.createBasicEmailHtml(context);
		}
	}

	/**
	 * Wrap content in email layout
	 */
	private wrapInLayout(content: string, context: any): string {
		const templateDir = this.configService.get<string>('email.templateDir') || 'templates/email';
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
			} catch (error) {
				this.logger.warn('Failed to apply layout, using content directly', error);
			}
		}

		return content;
	}

	/**
	 * Create basic HTML fallback for emails
	 */
	private createBasicEmailHtml(context: any): string {
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

	/**
	 * Get recipients based on audience type
	 */
	private async getAudienceRecipients(audience: NotificationAudienceEnum): Promise<User[]> {
		try {
			switch (audience) {
				case NotificationAudienceEnum.ADMINS:
					return await this.userRepository.find({
						where: {
							role: In([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV]),
							isActive: true
						},
					});

				case NotificationAudienceEnum.ALL_EXCEPT_UNKNOWN:
					return await this.userRepository.find({
						where: {
							role: In([
								UserRoleEnum.ADMIN,
								UserRoleEnum.MANAGER,
								UserRoleEnum.DEV,
								UserRoleEnum.SALES,
								UserRoleEnum.CUSTOMER
							]),
							isActive: true
						},
					});

				case NotificationAudienceEnum.ALL:
					return await this.userRepository.find({
						where: { isActive: true }
					});

				default:
					this.logger.warn(`Unknown audience type: ${audience}`);
					return [];
			}
		} catch (error) {
			this.logger.error('Failed to get audience recipients', error);
			return [];
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
					} catch (error) {
						this.logger.error(
							`Failed to email ${recipient.email}: ${error.message}`
						);
					}
				})
			);

			// Mark the broadcast notification as emailed
			savedNotification.emailSent = true;
			await this.notificationRepository.save(savedNotification);

			return { notified: recipients.length };
		} catch (error) {
			this.logger.error(
				'Failed to notify admins on new user',
				error?.stack || String(error)
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
		} catch (error) {
			throw error
		}
	}

	async getUnreadCount(userId: string) {
		try {
			const notifications = await this.getUserNotifications(userId);
			const count = notifications.filter((n) => !n.isRead).length;
			return { count };
		} catch (error) {
			throw error
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
		} catch (error) {
			throw error;
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
		try {
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
		} catch (error) {
			throw error
		}
	}

	renderTemplate(templateName: string, context: any) {
		try {
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
		} catch (error) {
			throw error
		}
	}

}
