"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditLogInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const auditLog_service_1 = require("../../modules/auditLog/auditLog.service");
const entity_enum_1 = require("../enum/entity.enum");
let AuditLogInterceptor = AuditLogInterceptor_1 = class AuditLogInterceptor {
    constructor(auditLogService) {
        this.auditLogService = auditLogService;
        this.logger = new common_1.Logger(AuditLogInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, headers, ip } = request;
        if (method === 'GET' || url.includes('/audit-logs')) {
            return next.handle();
        }
        const skipRoutes = [
            '/auth/register',
            '/auth/login',
            '/auth/forgot-password',
            '/auth/reset-password'
        ];
        if (skipRoutes.some(route => url.includes(route))) {
            this.logger.debug(`Skipping audit log for unauthenticated route: ${url}`);
            return next.handle();
        }
        const user = request.user;
        if (!user || !user.id) {
            this.logger.debug('Skipping audit log: No authenticated user');
            return next.handle();
        }
        this.logger.debug(`Creating audit log for user ${user.id}, method: ${method}, url: ${url}`);
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                this.createAuditLog(request, user, method, url, body, headers, ip);
            },
            error: (error) => {
                this.logger.warn(`Failed request: ${method} ${url} - ${error.message}`);
            },
        }));
    }
    async createAuditLog(request, user, method, url, body, headers, ip) {
        try {
            const entity = this.extractEntityFromUrl(url);
            const action = this.determineAction(method, url);
            const filteredHeaders = this.filterSensitiveHeaders(headers);
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
            this.logger.debug(`Audit log created: ${action} on ${entity} by user ${user.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
        }
    }
    extractEntityFromUrl(url) {
        const matches = url.match(/\/api\/([^\/]+)/);
        return matches ? matches[1] : 'unknown';
    }
    determineAction(method, url) {
        if (url.includes('/create') || method === 'POST') {
            return entity_enum_1.AuditActionEnum.CREATE;
        }
        else if (url.includes('/update') || method === 'PUT' || method === 'PATCH') {
            return entity_enum_1.AuditActionEnum.UPDATE;
        }
        else if (url.includes('/delete') || method === 'DELETE') {
            return entity_enum_1.AuditActionEnum.DELETE;
        }
        else if (url.includes('/login')) {
            return entity_enum_1.AuditActionEnum.LOGIN;
        }
        else if (url.includes('/register')) {
            return entity_enum_1.AuditActionEnum.REGISTER;
        }
        return entity_enum_1.AuditActionEnum.OTHER;
    }
    filterSensitiveHeaders(headers) {
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-access-token'];
        const filtered = { ...headers };
        sensitiveHeaders.forEach(header => {
            if (filtered[header]) {
                filtered[header] = '[REDACTED]';
            }
        });
        return filtered;
    }
    filterSensitiveData(data) {
        if (!data)
            return data;
        const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'creditCard', 'cvv'];
        const filtered = { ...data };
        sensitiveFields.forEach(field => {
            if (filtered[field]) {
                filtered[field] = '[REDACTED]';
            }
        });
        return filtered;
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = AuditLogInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auditLog_service_1.AuditLogService])
], AuditLogInterceptor);
//# sourceMappingURL=auditLog.interceptor.js.map