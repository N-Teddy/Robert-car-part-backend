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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auditLog_service_1 = require("./auditLog.service");
const audit_dto_1 = require("../../dto/response/audit.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
let AuditLogController = class AuditLogController {
    constructor(auditLogService) {
        this.auditLogService = auditLogService;
    }
    async findAll(filterDto) {
        try {
            return await this.auditLogService.findAllAuditLogs(filterDto);
        }
        catch (error) {
            throw error;
        }
    }
    async findOne(id) {
        try {
            return await this.auditLogService.findAuditLogById(id);
        }
        catch (error) {
            throw error;
        }
    }
};
exports.AuditLogController = AuditLogController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all audit logs with pagination and filters' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit logs retrieved successfully',
        type: audit_dto_1.PaginatedAuditLogResponseDto
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Records per page' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, type: String, description: 'Filter by user ID' }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false, enum: ['CREATE', 'UPDATE', 'DELETE'], description: 'Filter by action' }),
    (0, swagger_1.ApiQuery)({ name: 'entity', required: false, type: String, description: 'Filter by entity' }),
    (0, swagger_1.ApiQuery)({ name: 'route', required: false, type: String, description: 'Filter by route' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, description: 'Start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String, description: 'End date (ISO string)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_dto_1.AuditLogFilterDto]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit log by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit log retrieved successfully',
        type: audit_dto_1.AuditLogResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Audit log not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "findOne", null);
exports.AuditLogController = AuditLogController = __decorate([
    (0, swagger_1.ApiTags)('Audit Logs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('audit-logs'),
    __metadata("design:paramtypes", [auditLog_service_1.AuditLogService])
], AuditLogController);
//# sourceMappingURL=auditLog.controller.js.map