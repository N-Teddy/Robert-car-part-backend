import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { NotificationEnum, NotificationAudienceEnum } from '../../common/enum/entity.enum';
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
export declare class NotificationService {
    private readonly notificationRepository;
    private readonly userRepository;
    private readonly configService;
    private readonly logger;
    private transporter;
    private readonly defaultEmailTemplate;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<User>, configService: ConfigService);
    private initializeEmailTransport;
    private registerHandlebarsHelpers;
    createNotification(params: CreateNotificationParams): Promise<Notification>;
    private handleEmailNotificationAsync;
    private sendEmailToRecipient;
    private renderEmailTemplate;
    private wrapInLayout;
    private createBasicEmailHtml;
    private getAudienceRecipients;
    notifyAdminsOnNewUser(user: User): Promise<{
        notified: number;
    }>;
    getUserNotifications(userId: string): Promise<Notification[]>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<{
        message: string;
    }>;
    sendEmail({ to, subject, html, }: {
        to: string;
        subject: string;
        html: string;
    }): Promise<any>;
    renderTemplate(templateName: string, context: any): string;
}
export {};
