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
exports.CategoryQueryDto = exports.UpdateCategoryDto = exports.CreateCategoryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateCategoryDto {
}
exports.CreateCategoryDto = CreateCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'binary',
        description: 'Category image file (optional)',
    }),
    __metadata("design:type", Object)
], CreateCategoryDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category name', maxLength: 100 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Category description',
        maxLength: 500,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Parent category ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "parentId", void 0);
class UpdateCategoryDto {
}
exports.UpdateCategoryDto = UpdateCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'binary',
        description: 'Category image file (optional)',
    }),
    __metadata("design:type", Object)
], UpdateCategoryDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category name', maxLength: 100 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Category description',
        maxLength: 500,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Parent category ID (set to null for root)',
    }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === '') {
            return null;
        }
        return value;
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCategoryDto.prototype, "parentId", void 0);
class CategoryQueryDto {
}
exports.CategoryQueryDto = CategoryQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CategoryQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CategoryQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CategoryQueryDto.prototype, "search", void 0);
//# sourceMappingURL=category.dto.js.map