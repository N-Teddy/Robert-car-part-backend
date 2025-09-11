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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogFilterDto = exports.PaginatedAuditLogResponseDto = exports.AuditLogResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const entity_enum_1 = require("../../common/enum/entity.enum");
class AuditLogResponseDto {
}
exports.AuditLogResponseDto = AuditLogResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Audit log ID' }),
    __metadata("design:type", String)
], AuditLogResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User ID who performed the action' }),
    __metadata("design:type", String)
], AuditLogResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action performed', enum: entity_enum_1.AuditActionEnum }),
    __metadata("design:type", String)
], AuditLogResponseDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity affected by the action' }),
    __metadata("design:type", String)
], AuditLogResponseDto.prototype, "entity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Route that was accessed' }),
    __metadata("design:type", String)
], AuditLogResponseDto.prototype, "route", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Request body data' }),
    __metadata("design:type", Object)
], AuditLogResponseDto.prototype, "requestBody", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Request headers' }),
    __metadata("design:type", Object)
], AuditLogResponseDto.prototype, "requestHeaders", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User IP address' }),
    __metadata("design:type", String)
], AuditLogResponseDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User agent string' }),
    __metadata("design:type", String)
], AuditLogResponseDto.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when the action was performed' }),
    __metadata("design:type", Date)
], AuditLogResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last updated timestamp' }),
    __metadata("design:type", Date)
], AuditLogResponseDto.prototype, "updatedAt", void 0);
class PaginatedAuditLogResponseDto {
}
exports.PaginatedAuditLogResponseDto = PaginatedAuditLogResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AuditLogResponseDto] }),
    __metadata("design:type", Array)
], PaginatedAuditLogResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of records' }),
    __metadata("design:type", Number)
], PaginatedAuditLogResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page number' }),
    __metadata("design:type", Number)
], PaginatedAuditLogResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of records per page' }),
    __metadata("design:type", Number)
], PaginatedAuditLogResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages' }),
    __metadata("design:type", Number)
], PaginatedAuditLogResponseDto.prototype, "totalPages", void 0);
class AuditLogFilterDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.AuditLogFilterDto = AuditLogFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number for pagination',
        default: 1,
    }),
    __metadata("design:type", Number)
], AuditLogFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of records per page',
        default: 10,
    }),
    __metadata("design:type", Number)
], AuditLogFilterDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by user ID' }),
    __metadata("design:type", String)
], AuditLogFilterDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by action',
        enum: entity_enum_1.AuditActionEnum,
    }),
    __metadata("design:type", String)
], AuditLogFilterDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by entity' }),
    __metadata("design:type", String)
], AuditLogFilterDto.prototype, "entity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by route' }),
    __metadata("design:type", String)
], AuditLogFilterDto.prototype, "route", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Start date for date range filter (ISO string)',
    }),
    __metadata("design:type", String)
], AuditLogFilterDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'End date for date range filter (ISO string)',
    }),
    __metadata("design:type", String)
], AuditLogFilterDto.prototype, "endDate", void 0);
//# sourceMappingURL=audit.dto.js.map