import { AuditActionEnum } from 'src/common/enum/entity.enum';
export declare class CreateAuditLogRequestDto {
    action: AuditActionEnum;
    entity: string;
    details?: any;
    route: string;
    ipAddress?: string;
    userAgent?: string;
    userId?: string;
}
