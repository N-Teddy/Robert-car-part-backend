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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuditLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("../../entities/audit-log.entity");
const entity_enum_1 = require("../../common/enum/entity.enum");
let AuditLogService = AuditLogService_1 = class AuditLogService {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.logger = new common_1.Logger(AuditLogService_1.name);
    }
    async create(createAuditLogDto) {
        const auditLog = this.auditLogRepository.create(createAuditLogDto);
        return this.auditLogRepository.save(auditLog);
    }
    async logRequest(request, response, userId) {
        const method = request.method.toUpperCase();
        const actionMap = {
            POST: entity_enum_1.AuditActionEnum.CREATE,
            PUT: entity_enum_1.AuditActionEnum.UPDATE,
            PATCH: entity_enum_1.AuditActionEnum.UPDATE,
            DELETE: entity_enum_1.AuditActionEnum.DELETE,
        };
        const action = actionMap[method];
        if (!action)
            return;
        this.createLogAsync(action, request, response, userId).catch(error => {
            this.logger.error('Failed to create audit log:', error.message);
        });
    }
    async createLogAsync(action, request, response, userId) {
        const entity = this.extractEntityFromRoute(request.route);
        const ipAddress = request.ip || request.connection?.remoteAddress;
        const userAgent = request.get('user-agent');
        const details = {
            request: {
                body: request.body,
                params: request.params,
                query: request.query,
                headers: this.sanitizeHeaders(request.headers),
            },
            response: {
                statusCode: response.statusCode,
                statusMessage: response.statusMessage,
            },
            timestamp: new Date().toISOString(),
        };
        const createAuditLogDto = {
            action,
            entity,
            details,
            route: request.route?.path || request.url,
            ipAddress,
            userAgent,
            userId,
        };
        await this.create(createAuditLogDto);
    }
    extractEntityFromRoute(route) {
        if (!route)
            return 'unknown';
        const path = route.path || '';
        const segments = path.split('/').filter(segment => segment && !segment.match(/^:/));
        return segments[1] || 'unknown';
    }
    sanitizeHeaders(headers) {
        const sensitiveHeaders = ['authorization', 'cookie', 'token', 'password'];
        const sanitized = { ...headers };
        sensitiveHeaders.forEach(header => {
            const lowerHeader = header.toLowerCase();
            Object.keys(sanitized).forEach(key => {
                if (key.toLowerCase() === lowerHeader) {
                    sanitized[key] = '***REDACTED***';
                }
            });
        });
        return sanitized;
    }
    async findAll(page = 1, limit = 10) {
        const [data, total] = await this.auditLogRepository.findAndCount({
            relations: ['user'],
            order: { timestamp: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total };
    }
    async findById(id) {
        return this.auditLogRepository.findOne({
            where: { id },
            relations: ['user'],
        });
    }
    async findByUserId(userId, page = 1, limit = 10) {
        const [data, total] = await this.auditLogRepository.findAndCount({
            where: { user: { id: userId } },
            relations: ['user'],
            order: { timestamp: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total };
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = AuditLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map