import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
export declare class NotificationService {
    private readonly notificationRepository;
    private readonly userRepository;
    private readonly configService;
    private readonly logger;
    private transporter;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<User>, configService: ConfigService);
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
    sendEmail({ to, subject, html }: {
        to: string;
        subject: string;
        html: string;
    }): Promise<any>;
    renderTemplate(templateName: string, context: any): string;
}
