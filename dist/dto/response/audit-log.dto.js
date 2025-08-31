"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogResponseDto = void 0;
class AuditLogResponseDto {
    constructor(auditLog) {
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
exports.AuditLogResponseDto = AuditLogResponseDto;
//# sourceMappingURL=audit-log.dto.js.map