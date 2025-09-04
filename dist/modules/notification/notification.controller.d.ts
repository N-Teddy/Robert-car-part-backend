import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    list(req: any): Promise<{
        notifications: import("../../entities/notification.entity").Notification[];
        total: number;
    }>;
    count(req: any): Promise<number>;
    markRead(id: string, req: any): Promise<import("../../entities/notification.entity").Notification>;
}
