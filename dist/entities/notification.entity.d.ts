import { User } from './user.entity';
import { NotificationEnum, NotificationAudienceEnum } from 'src/common/enum/entity.enum';
import { BaseEntity } from './base.entity';
export declare class Notification extends BaseEntity {
    type: NotificationEnum;
    title: string;
    message: string;
    isRead: boolean;
    metadata: Record<string, any>;
    user?: User | null;
    emailSent: boolean;
    audience: NotificationAudienceEnum;
}
