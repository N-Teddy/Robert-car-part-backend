import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { CreateAuditLogDto } from '../../dto/request/audit.dto';
import { AuditLogResponseDto, PaginatedAuditLogResponseDto, AuditLogFilterDto } from '../../dto/response/audit.dto';
export declare class AuditLogService {
    private readonly auditLogRepository;
    private readonly logger;
    constructor(auditLogRepository: Repository<AuditLog>);
    createAuditLog(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog>;
    findAllAuditLogs(filterDto: AuditLogFilterDto): Promise<PaginatedAuditLogResponseDto>;
    findAuditLogById(id: string): Promise<AuditLogResponseDto>;
    private mapToResponseDto;
}
