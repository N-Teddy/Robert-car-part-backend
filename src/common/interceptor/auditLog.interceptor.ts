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

	constructor(private readonly auditLogService: AuditLogService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();
		const { method, url, body, headers, ip } = request;

		// Skip GET requests and audit log routes to avoid infinite loops
		if (method === 'GET' || url.includes('/audit-logs')) {
			return next.handle();
		}

		// Skip authentication-related routes that don't have users
		const skipRoutes = [
			'/auth/register',
			'/auth/login',
			'/auth/forgot-password',
			'/auth/reset-password',
		];

		if (skipRoutes.some((route) => url.includes(route))) {
			this.logger.debug(
				`Skipping audit log for unauthenticated route: ${url}`
			);
			return next.handle();
		}
		// Get user from request (might be attached by auth guard)
		const user = request.user;
		if (!user || !user.id) {
			this.logger.debug('Skipping audit log: No authenticated user');
			return next.handle();
		}

		this.logger.debug(
			`Creating audit log for user ${user.id}, method: ${method}, url: ${url}`
		);

		return next.handle().pipe(
			tap({
				next: () => {
					// Log successful requests
					this.createAuditLog(
						request,
						user,
						method,
						url,
						body,
						headers,
						ip
					);
				},
				error: (error) => {
					// Optionally log failed requests too
					this.logger.warn(
						`Failed request: ${method} ${url} - ${error.message}`
					);
				},
			})
		);
	}

	private async createAuditLog(
		request: any,
		user: any,
		method: string,
		url: string,
		body: any,
		headers: any,
		ip: string
	) {
		try {
			// Extract entity from URL
			const entity = this.extractEntityFromUrl(url);

			// Determine action based on method and URL
			const action = this.determineAction(method, url);

			// Filter sensitive headers
			const filteredHeaders = this.filterSensitiveHeaders(headers);

			// Filter sensitive data from request body
			const filteredBody = this.filterSensitiveData(body);

			await this.auditLogService.createAuditLog({
				userId: user.id,
				action,
				entity,
				route: url,
				method,
				requestBody: filteredBody,
				requestHeaders: filteredHeaders,
				ipAddress: ip,
				userAgent: headers['user-agent'],
			});

			this.logger.debug(
				`Audit log created: ${action} on ${entity} by user ${user.id}`
			);
		} catch (error) {
			this.logger.error(
				`Failed to create audit log: ${error.message}`,
				error.stack
			);
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
		} else if (
			url.includes('/update') ||
			method === 'PUT' ||
			method === 'PATCH'
		) {
			return AuditActionEnum.UPDATE;
		} else if (url.includes('/delete') || method === 'DELETE') {
			return AuditActionEnum.DELETE;
		} else if (url.includes('/login')) {
			return AuditActionEnum.LOGIN;
		} else if (url.includes('/register')) {
			return AuditActionEnum.REGISTER;
		}
		return AuditActionEnum.OTHER;
	}

	private filterSensitiveHeaders(headers: any): any {
		const sensitiveHeaders = [
			'authorization',
			'cookie',
			'x-api-key',
			'x-access-token',
		];
		const filtered = { ...headers };

		sensitiveHeaders.forEach((header) => {
			if (filtered[header]) {
				filtered[header] = '[REDACTED]';
			}
		});

		return filtered;
	}

	private filterSensitiveData(data: any): any {
		if (!data) return data;

		const sensitiveFields = [
			'password',
			'token',
			'accessToken',
			'refreshToken',
			'creditCard',
			'cvv',
		];
		const filtered = { ...data };

		sensitiveFields.forEach((field) => {
			if (filtered[field]) {
				filtered[field] = '[REDACTED]';
			}
		});

		return filtered;
	}
}
