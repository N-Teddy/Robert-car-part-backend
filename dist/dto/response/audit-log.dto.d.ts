import { AuditActionEnum } from 'src/common/enum/entity.enum';
export declare class AuditLogResponseDto {
    id: string;
    action: AuditActionEnum;
    entity: string;
    details: any;
    route: string;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    userId: string | null;
    createdAt: Date;
    updatedAt: Date;
    constructor(auditLog: any);
}
