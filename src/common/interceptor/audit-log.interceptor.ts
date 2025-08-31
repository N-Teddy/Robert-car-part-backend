// src/interceptors/audit-log.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from 'src/modules/audit-log/audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    constructor(private readonly auditLogService: AuditLogService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        // Get user ID from JWT token (from passport strategy)
        const userId = request.user?.id;

        return next.handle().pipe(
            tap(() => {
                // Non-blocking call - fire and forget
                this.auditLogService.logRequest(request, response, userId)
                    .catch(() => {
                        // Silently fail - errors are already logged in the service
                    });
            }),
        );
    }
}