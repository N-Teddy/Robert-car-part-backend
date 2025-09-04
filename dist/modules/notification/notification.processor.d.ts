import { Job } from 'bull';
import { NotificationService } from './notification.service';
export declare class NotificationProcessor {
    private notificationService;
    private readonly logger;
    constructor(notificationService: NotificationService);
    handleNotification(job: Job<{
        notificationId: string;
    }>): Promise<void>;
}
