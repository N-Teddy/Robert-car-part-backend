import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { NotificationEnum } from '../common/enum/notification.enum';
export declare class Notification extends BaseEntity {
    type: NotificationEnum;
    title: string;
    message: string;
    isRead: boolean;
    metadata: Record<string, any>;
    user?: User | null;
    emailSent: boolean;
}
