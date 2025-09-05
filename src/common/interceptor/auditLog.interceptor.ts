import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../../modules/auditLog/auditLog.service';
import { AuditActionEnum } from '../enum/entity.enum';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditLogInterceptor.name);

    constructor(private readonly auditLogService: AuditLogService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, headers, user, ip } = request;

        // Skip GET requests and audit log routes to avoid infinite loops
        if (method === 'GET' || url.includes('/audit-logs')) {
            return next.handle();
        }

        // Skip if no user is authenticated
        if (!user || !user.id) {
            return next.handle();
        }

        return next.handle().pipe(
            tap({
                next: () => {
                    // Log successful requests
                    this.createAuditLog(request, user, method, url, body, headers, ip);
                },
                error: (error) => {
                    // Optionally log failed requests too
                    this.logger.warn(`Failed request: ${method} ${url} - ${error.message}`);
                },
            }),
        );
    }

    private async createAuditLog(
        request: any,
        user: any,
        method: string,
        url: string,
        body: any,
        headers: any,
        ip: string,
    ) {
        try {
            // Extract entity from URL (e.g., /api/users/create -> users)
            const entity = this.extractEntityFromUrl(url);

            // Determine action based on method and URL
            const action = this.determineAction(method, url);

            // Filter sensitive headers
            const filteredHeaders = this.filterSensitiveHeaders(headers);

            await this.auditLogService.createAuditLog({
                userId: user.id,
                action,
                entity,
                route: url,
                method,
                requestBody: body,
                requestHeaders: filteredHeaders,
                ipAddress: ip,
                userAgent: headers['user-agent'],
            });
        } catch (error) {
            this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
        }
    }

    private extractEntityFromUrl(url: string): string {
        // Extract entity from URL pattern: /api/{entity}/action
        const matches = url.match(/\/api\/([^\/]+)/);
        return matches ? matches[1] : 'unknown';
    }

    private determineAction(method: string, url: string): AuditActionEnum {
        if (url.includes('/create') || method === 'POST') {
            return AuditActionEnum.CREATE;
        } else if (url.includes('/update') || method === 'PUT' || method === 'PATCH') {
            return AuditActionEnum.UPDATE;
        } else if (url.includes('/delete') || method === 'DELETE') {
            return AuditActionEnum.DELETE;
        }
        return AuditActionEnum.CREATE; // Default fallback
    }

    private filterSensitiveHeaders(headers: any): any {
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        const filtered = { ...headers };

        sensitiveHeaders.forEach(header => {
            if (filtered[header]) {
                filtered[header] = '[REDACTED]';
            }
        });

        return {
            'user-agent': filtered['user-agent'],
            'content-type': filtered['content-type'],
            'accept': filtered['accept'],
            'authorization': filtered['authorization'],
        };
    }
}
