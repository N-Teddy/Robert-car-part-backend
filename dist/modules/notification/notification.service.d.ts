import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { EmailService } from './email.service';
import { NotificationGateway } from './notification.gateway';
import { CreateNotificationDto, SendNotificationDto, BatchSendNotificationDto, MarkAsReadDto, NotificationFilterDto } from '../../dto/request/notification.dto';
import { NotificationResponseDto, SendNotificationResultDto, BatchSendResultDto } from '../../dto/response/notification.dto';
export declare class NotificationService {
    private readonly notificationRepository;
    private readonly userRepository;
    private readonly emailService;
    private readonly notificationGateway;
    private readonly logger;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<User>, emailService: EmailService, notificationGateway: NotificationGateway);
    createNotification(dto: CreateNotificationDto): Promise<NotificationResponseDto>;
    sendNotification(dto: SendNotificationDto): Promise<SendNotificationResultDto>;
    batchSendNotifications(dto: BatchSendNotificationDto): Promise<BatchSendResultDto>;
    markAsRead(dto: MarkAsReadDto, userId: string): Promise<void>;
    getNotifications(filter: NotificationFilterDto): Promise<NotificationResponseDto[]>;
    getUnreadCount(userId: string): Promise<number>;
    deleteOldNotifications(daysToKeep?: number): Promise<number>;
    getNotificationById(id: string, userId: string): Promise<NotificationResponseDto>;
    private getRecipients;
    private getActionUrl;
    private mapToResponseDto;
}
