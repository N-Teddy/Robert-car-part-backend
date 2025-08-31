import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuditLogService } from 'src/modules/audit-log/audit-log.service';
export declare class AuditLogInterceptor implements NestInterceptor {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
