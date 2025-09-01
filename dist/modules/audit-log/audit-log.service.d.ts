import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { CreateAuditLogRequestDto } from 'src/dto/request/audit-log.dto';
export declare class AuditLogService {
    private readonly auditLogRepository;
    private readonly logger;
    constructor(auditLogRepository: Repository<AuditLog>);
    create(createAuditLogDto: CreateAuditLogRequestDto): Promise<AuditLog>;
    logRequest(request: any, response: any, userId?: string): Promise<void>;
    private createLogAsync;
    findAll(page?: number, limit?: number): Promise<{
        data: AuditLog[];
        total: number;
    }>;
    findById(id: string): Promise<AuditLog>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<{
        data: AuditLog[];
        total: number;
    }>;
    private extractEntityFromRoute;
    private sanitizeHeaders;
}
