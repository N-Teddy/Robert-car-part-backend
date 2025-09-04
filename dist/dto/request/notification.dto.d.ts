import { NotificationChannel, NotificationPriority, NotificationStatus, NotificationType } from 'src/common/enum/notification.enum';
export declare class CreateNotificationDto {
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    priority?: NotificationPriority;
    title: string;
    content: string;
    metadata?: Record<string, any>;
    payload?: Record<string, any>;
}
export declare class UpdateNotificationPreferencesDto {
    email?: {
        enabled: boolean;
        types?: NotificationType[];
    };
    inApp?: {
        enabled: boolean;
        types?: NotificationType[];
    };
}
export declare class MarkNotificationAsReadDto {
    notificationId: string;
}
export declare class GetNotificationsQueryDto {
    status?: NotificationStatus;
    type?: NotificationType;
    limit?: number;
    offset?: number;
}
