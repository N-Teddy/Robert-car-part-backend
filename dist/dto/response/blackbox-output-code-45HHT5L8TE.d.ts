import { NotificationEnum } from '../../common/enum/notification.enum';
export declare class NotificationResponseDto {
    id: string;
    type: NotificationEnum;
    title: string;
    message: string;
    isRead: boolean;
    metadata?: Record<string, any>;
    userId?: string;
    emailSent: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SendNotificationResultDto {
    success: boolean;
    totalRecipients: number;
    emailsSent: number;
    emailsFailed: number;
    websocketsSent: number;
    notificationIds: string[];
    errors?: string[];
}
export declare class BatchSendResultDto {
    totalBatches: number;
    successfulBatches: number;
    failedBatches: number;
    results: SendNotificationResultDto[];
}
