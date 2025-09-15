import { NotificationService } from './notification.service';
import { SendNotificationDto, BatchSendNotificationDto, MarkAsReadDto, NotificationFilterDto, NotificationListResponseDto } from '../../dto/request/notification.dto';
import { NotificationResponseDto, SendNotificationResultDto, BatchSendResultDto } from '../../dto/response/notification.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    sendNotification(dto: SendNotificationDto): Promise<SendNotificationResultDto>;
    batchSendNotifications(dto: BatchSendNotificationDto): Promise<BatchSendResultDto>;
    markAsRead(dto: MarkAsReadDto, req: any): Promise<void>;
    getNotifications(filter: NotificationFilterDto): Promise<NotificationListResponseDto>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    getNotificationById(id: string, req: any): Promise<NotificationResponseDto>;
    cleanupOldNotifications(daysToKeep?: number): Promise<{
        deleted: number;
    }>;
}
