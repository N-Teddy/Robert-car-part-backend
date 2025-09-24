import { User } from './user.entity';
import { AuditActionEnum } from 'src/common/enum/entity.enum';
import { BaseEntity } from './base.entity';
export declare class AuditLog extends BaseEntity {
    user: User | null;
    action: AuditActionEnum;
    entity: string;
    details: any;
    route: string;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
}
