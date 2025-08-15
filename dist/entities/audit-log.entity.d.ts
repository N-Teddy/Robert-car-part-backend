import { User } from './user.entity';
import { AuditActionEnum } from 'src/common/enum/entity.enum';
import { BaseEntity } from './base.entity';
export declare class AuditLog extends BaseEntity {
    user: User;
    action: AuditActionEnum;
    entity: string;
    details: any;
    route: string;
    userId: string;
    timestamp: Date;
}
