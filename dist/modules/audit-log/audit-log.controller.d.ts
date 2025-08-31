import { AuditLogService } from './audit-log.service';
import { AuditLogResponseDto } from 'src/dto/response/audit-log.dto';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findAll(page?: number, limit?: number): Promise<{
        data: AuditLogResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<AuditLogResponseDto>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<{
        data: AuditLogResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
