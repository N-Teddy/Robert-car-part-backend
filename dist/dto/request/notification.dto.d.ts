import { NotificationEnum, NotificationAudienceEnum, NotificationChannelEnum } from '../../common/enum/notification.enum';
import { NotificationResponseDto } from '../response/notification.dto';
export declare class CreateNotificationDto {
    type: NotificationEnum;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    userId?: string;
}
export declare class SendNotificationDto {
    type: NotificationEnum;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    audience: NotificationAudienceEnum;
    userIds?: string[];
    channel?: NotificationChannelEnum;
    emailTemplate?: string;
}
export declare class BatchSendNotificationDto {
    notifications: SendNotificationDto[];
}
export declare class MarkAsReadDto {
    notificationIds: string[];
}
export declare class NotificationFilterDto {
    type?: NotificationEnum;
    isRead?: boolean;
    userId?: string;
    search?: string;
    page?: number;
    limit?: number;
}
export declare class NotificationListResponseDto {
    items: NotificationResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
