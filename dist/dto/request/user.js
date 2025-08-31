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
exports.StaffStatisticsDto = exports.UpdateProfileDto = exports.StaffFilterDto = exports.UpdateStaffDto = exports.CreateStaffDto = exports.AssignRoleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const entity_enum_1 = require("../../common/enum/entity.enum");
class AssignRoleDto {
}
exports.AssignRoleDto = AssignRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New role to assign',
        enum: entity_enum_1.UserRoleEnum,
        example: entity_enum_1.UserRoleEnum.MANAGER,
    }),
    (0, class_validator_1.IsEnum)(entity_enum_1.UserRoleEnum),
    __metadata("design:type", String)
], AssignRoleDto.prototype, "role", void 0);
class CreateStaffDto {
}
exports.CreateStaffDto = CreateStaffDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'staff@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateStaffDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateStaffDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+1234567890' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStaffDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: entity_enum_1.UserRoleEnum, example: entity_enum_1.UserRoleEnum.MANAGER }),
    (0, class_validator_1.IsEnum)([entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.DEV]),
    __metadata("design:type", String)
], CreateStaffDto.prototype, "role", void 0);
class UpdateStaffDto {
}
exports.UpdateStaffDto = UpdateStaffDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Smith' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdateStaffDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+1234567890' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStaffDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: entity_enum_1.UserRoleEnum, example: entity_enum_1.UserRoleEnum.DEV }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)([entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.DEV]),
    __metadata("design:type", String)
], UpdateStaffDto.prototype, "role", void 0);
class StaffFilterDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.StaffFilterDto = StaffFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: entity_enum_1.UserRoleEnum }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(entity_enum_1.UserRoleEnum),
    __metadata("design:type", String)
], StaffFilterDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffFilterDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StaffFilterDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], StaffFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], StaffFilterDto.prototype, "limit", void 0);
class UpdateProfileDto {
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Jane Doe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+1234567890' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "phoneNumber", void 0);
class StaffStatisticsDto {
}
exports.StaffStatisticsDto = StaffStatisticsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15 }),
    __metadata("design:type", Number)
], StaffStatisticsDto.prototype, "totalStaff", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12 }),
    __metadata("design:type", Number)
], StaffStatisticsDto.prototype, "activeStaff", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], StaffStatisticsDto.prototype, "inactiveStaff", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { ADMIN: 2, MANAGER: 5, DEV: 5 } }),
    __metadata("design:type", Object)
], StaffStatisticsDto.prototype, "byRole", void 0);
//# sourceMappingURL=user.js.map