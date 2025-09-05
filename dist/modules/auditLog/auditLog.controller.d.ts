import { AuditLogService } from './auditLog.service';
import { AuditLogResponseDto, PaginatedAuditLogResponseDto, AuditLogFilterDto } from '../../dto/response/audit.dto';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findAll(filterDto: AuditLogFilterDto): Promise<PaginatedAuditLogResponseDto>;
    findOne(id: string): Promise<AuditLogResponseDto>;
}
