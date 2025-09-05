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
        const { method, url, body, headers, user, ip } = request;
        if (method === 'GET' || url.includes('/audit-logs')) {
            return next.handle();
        }
        if (!user || !user.id) {
            return next.handle();
        }
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
        return entity_enum_1.AuditActionEnum.CREATE;
    }
    filterSensitiveHeaders(headers) {
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
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = AuditLogInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auditLog_service_1.AuditLogService])
], AuditLogInterceptor);
//# sourceMappingURL=auditLog.interceptor.js.map