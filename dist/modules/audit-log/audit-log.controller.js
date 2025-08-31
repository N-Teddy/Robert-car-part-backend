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
const audit_log_service_1 = require("./audit-log.service");
const entity_enum_1 = require("../../common/enum/entity.enum");
const audit_log_dto_1 = require("../../dto/response/audit-log.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let AuditLogController = class AuditLogController {
    constructor(auditLogService) {
        this.auditLogService = auditLogService;
    }
    async findAll(page = 1, limit = 10) {
        const result = await this.auditLogService.findAll(page, limit);
        return {
            data: result.data.map(log => new audit_log_dto_1.AuditLogResponseDto(log)),
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit),
        };
    }
    async findById(id) {
        const auditLog = await this.auditLogService.findById(id);
        return new audit_log_dto_1.AuditLogResponseDto(auditLog);
    }
    async findByUserId(userId, page = 1, limit = 10) {
        const result = await this.auditLogService.findByUserId(userId, page, limit);
        return {
            data: result.data.map(log => new audit_log_dto_1.AuditLogResponseDto(log)),
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit),
        };
    }
};
exports.AuditLogController = AuditLogController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "findByUserId", null);
exports.AuditLogController = AuditLogController = __decorate([
    (0, common_1.Controller)('audit-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.DEV),
    __metadata("design:paramtypes", [audit_log_service_1.AuditLogService])
], AuditLogController);
//# sourceMappingURL=audit-log.controller.js.map