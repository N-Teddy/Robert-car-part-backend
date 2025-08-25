import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    list(req: any): Promise<import("../../entities/notification.entity").Notification[]>;
    count(req: any): Promise<{
        count: number;
    }>;
    markRead(id: string, req: any): Promise<{
        message: string;
    }>;
}
