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
let AuditLogService = AuditLogService_1 = class AuditLogService {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.logger = new common_1.Logger(AuditLogService_1.name);
    }
    async createAuditLog(createAuditLogDto) {
        try {
            const auditLog = this.auditLogRepository.create(createAuditLogDto);
            const savedLog = await this.auditLogRepository.save(auditLog);
            this.logger.log(`Audit log created for user ${createAuditLogDto.userId}, action: ${createAuditLogDto.action}`);
            return savedLog;
        }
        catch (error) {
            this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findAllAuditLogs(filterDto) {
        try {
            const { page = 1, limit = 10, userId, action, entity, route, startDate, endDate, } = filterDto;
            const skip = (page - 1) * limit;
            const whereConditions = {};
            if (userId) {
                whereConditions.userId = userId;
            }
            if (action) {
                whereConditions.action = action;
            }
            if (entity) {
                whereConditions.entity = entity;
            }
            if (route) {
                whereConditions.route = route;
            }
            if (startDate && endDate) {
                whereConditions.createdAt = (0, typeorm_2.Between)(new Date(startDate), new Date(endDate));
            }
            else if (startDate) {
                whereConditions.createdAt = (0, typeorm_2.Between)(new Date(startDate), new Date());
            }
            else if (endDate) {
                whereConditions.createdAt = (0, typeorm_2.Between)(new Date('1970-01-01'), new Date(endDate));
            }
            const findOptions = {
                where: whereConditions,
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
            };
            const [auditLogs, total] = await this.auditLogRepository.findAndCount(findOptions);
            const totalPages = Math.ceil(total / limit);
            return {
                data: auditLogs.map((log) => this.mapToResponseDto(log)),
                total,
                page,
                limit,
                totalPages,
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch audit logs: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findAuditLogById(id) {
        try {
            const auditLog = await this.auditLogRepository.findOne({
                where: { id },
            });
            if (!auditLog) {
                throw new common_1.NotFoundException(`Audit log with ID ${id} not found`);
            }
            return this.mapToResponseDto(auditLog);
        }
        catch (error) {
            this.logger.error(`Failed to fetch audit log by ID ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    mapToResponseDto(auditLog) {
        return {
            id: auditLog.id,
            userId: auditLog.user?.id || null,
            action: auditLog.action,
            entity: auditLog.entity,
            route: auditLog.route,
            requestBody: auditLog.details,
            ipAddress: auditLog.ipAddress,
            userAgent: auditLog.userAgent,
            createdAt: auditLog.createdAt,
            updatedAt: auditLog.updatedAt,
        };
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = AuditLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditLogService);
//# sourceMappingURL=auditLog.service.js.map