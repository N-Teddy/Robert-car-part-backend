import { Injectable, Logger, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { NotificationEnum, UserRoleEnum, NotificationAudienceEnum } from '../../common/enum/entity.enum';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private transporter: nodemailer.Transporter;

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
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
                minute: '2-digit'
            }).format(new Date(date));
        });
    }

    private async getAudienceRecipients(audience: NotificationAudienceEnum) {
        switch (audience) {
            case NotificationAudienceEnum.ADMINS:
                return this.userRepository.find({ where: { role: In([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV]) } });
            case NotificationAudienceEnum.ALL_EXCEPT_UNKNOWN:
                return this.userRepository.find({ where: { role: In([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV, UserRoleEnum.SALES, UserRoleEnum.CUSTOMER]) } });
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
                    adminPanelUrl
                },
            });
            const savedNotification = await this.notificationRepository.save(notification);

            // Send emails to all recipients
            await Promise.all(
                recipients.map(async (recipient) => {
                    try {
                        const html = this.renderTemplate('notify-admin-new-user', {
                            user: {
                                id: user.id,
                                email: user.email,
                                fullName: user.fullName || 'Not provided',
                                createdAt: user.createdAt
                            },
                            adminPanelUrl,
                            title: 'New User Registration'
                        });

                        await this.sendEmail({
                            to: recipient.email,
                            subject: title,
                            html,
                        });
                    } catch (err) {
                        this.logger.error(`Failed to email ${recipient.email}: ${err.message}`);
                    }
                }),
            );

            // Mark the broadcast notification as emailed
            savedNotification.emailSent = true;
            await this.notificationRepository.save(savedNotification);

            return { notified: recipients.length };
        } catch (err) {
            this.logger.error('Failed to notify admins on new user', err?.stack || String(err));
            throw new InternalServerErrorException('Failed to send notifications');
        }
    }

    async getUserNotifications(userId: string) {
        try {
            // Fetch notifications that target the user's role via audience OR are specific to the user
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) return [];
            const visibleAudiences = [NotificationAudienceEnum.ALL, NotificationAudienceEnum.ALL_EXCEPT_UNKNOWN];
            if ([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV].includes(user.role)) {
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
            throw new InternalServerErrorException('Failed to fetch notifications');
        }
    }

    async getUnreadCount(userId: string) {
        try {
            const notifications = await this.getUserNotifications(userId);
            const count = notifications.filter((n) => !n.isRead).length;
            return { count };
        } catch (err) {
            throw new InternalServerErrorException('Failed to count unread notifications');
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
                throw new ForbiddenException('Cannot modify others\' notifications');
            }
            if (!notification.isRead) {
                await this.notificationRepository.update({ id: notification.id }, { isRead: true });
            }
            return { message: 'Notification marked as read' };
        } catch (err) {
            if (err instanceof NotFoundException || err instanceof ForbiddenException) {
                throw err;
            }
            // throw new InternalServerErrorException('Failed to mark notification as read');
            throw err
        }
    }

    async sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
        const fromName = this.configService.get<string>('email.defaultFromName');
        const fromEmail = this.configService.get<string>('email.defaultFromEmail');

        const info = await this.transporter.sendMail({
            from: `${fromName} <${fromEmail}>`,
            to,
            subject,
            html,
        });

        this.logger.log(`Email sent: ${info.messageId}`);
        return info;
    }

    private renderTemplate(templateName: string, context: any) {
        const templateDir = this.configService.get<string>('email.templateDir') || 'templates/email';
        const layoutPath = path.resolve(templateDir, 'layout.hbs');
        const templatePath = path.resolve(templateDir, `${templateName}.hbs`);

        const layoutSrc = fs.readFileSync(layoutPath, 'utf8');
        const templateSrc = fs.readFileSync(templatePath, 'utf8');

        // Support partial-like layout injection
        const layout = Handlebars.compile(layoutSrc);
        const content = Handlebars.compile(templateSrc)(context);

        return layout({ title: context.title || 'Car Parts Shop', body: content });
    }

    async sendPasswordResetEmail(to: string, resetLink: string) {
        const html = this.renderTemplate('password-reset', { resetLink });
        return this.sendEmail({ to, subject: 'Password Reset Request', html });
    }

    async sendWelcomePendingRoleEmail(to: string, fullName?: string) {
        const html = this.renderTemplate('welcome-pending-role', { name: fullName || 'there' });
        return this.sendEmail({ to, subject: 'Welcome - Pending Role Assignment', html });
    }

    async sendPasswordResetConfirmationEmail(to: string) {
        const html = this.renderTemplate('password-reset-confirm', {});
        return this.sendEmail({ to, subject: 'Your password has been reset', html });
    }

    async sendPasswordChangeConfirmationEmail(to: string) {
        const html = this.renderTemplate('password-change-confirm', {});
        return this.sendEmail({ to, subject: 'Your password has been changed', html });
    }

    async sendRoleAssignedEmail(to: string, role: string) {
        const html = this.renderTemplate('role-assigned', { role });
        return this.sendEmail({ to, subject: 'Your role has been updated', html });
    }
}