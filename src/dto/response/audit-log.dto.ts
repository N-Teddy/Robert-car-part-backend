import { AuditActionEnum } from 'src/common/enum/entity.enum';

export class AuditLogResponseDto {
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

    constructor(auditLog: any) {
        this.id = auditLog.id;
        this.action = auditLog.action;
        this.entity = auditLog.entity;
        this.details = auditLog.details;
        this.route = auditLog.route;
        this.timestamp = auditLog.timestamp;
        this.ipAddress = auditLog.ipAddress;
        this.userAgent = auditLog.userAgent;
        this.userId = auditLog.user?.id || auditLog.userId || null;
        this.createdAt = auditLog.createdAt;
        this.updatedAt = auditLog.updatedAt;
    }
}