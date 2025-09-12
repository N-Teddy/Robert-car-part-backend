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
exports.PaginatedCategoryTreeResponse = exports.CategoryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CategoryResponseDto {
    static fromEntity(entity) {
        const dto = new CategoryResponseDto();
        dto.id = entity.id;
        dto.name = entity.name;
        dto.description = entity.description;
        if (entity.parent) {
            dto.parentId = entity.parent.id;
        }
        const img = entity.image;
        if (img) {
            dto.image = {
                id: img.id,
                url: img.url,
                publicId: img.publicId,
                format: img.format,
            };
        }
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;
        return dto;
    }
    static fromEntityWithChildren(entity) {
        const dto = this.fromEntity(entity);
        if (entity.children && entity.children.length > 0) {
            dto.children = entity.children.map((child) => this.fromEntityWithChildren(child));
        }
        return dto;
    }
}
exports.CategoryResponseDto = CategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category ID' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category name' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category description' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Category image',
        type: Object,
    }),
    __metadata("design:type", Object)
], CategoryResponseDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Parent category ID' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Child categories',
        type: [CategoryResponseDto],
        required: false,
    }),
    __metadata("design:type", Array)
], CategoryResponseDto.prototype, "children", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation date' }),
    __metadata("design:type", Date)
], CategoryResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update date' }),
    __metadata("design:type", Date)
], CategoryResponseDto.prototype, "updatedAt", void 0);
class PaginatedCategoryTreeResponse {
}
exports.PaginatedCategoryTreeResponse = PaginatedCategoryTreeResponse;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CategoryResponseDto], description: 'Array of category trees' }),
    __metadata("design:type", Array)
], PaginatedCategoryTreeResponse.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of root categories' }),
    __metadata("design:type", Number)
], PaginatedCategoryTreeResponse.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page number' }),
    __metadata("design:type", Number)
], PaginatedCategoryTreeResponse.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of items per page' }),
    __metadata("design:type", Number)
], PaginatedCategoryTreeResponse.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages' }),
    __metadata("design:type", Number)
], PaginatedCategoryTreeResponse.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there is a next page' }),
    __metadata("design:type", Boolean)
], PaginatedCategoryTreeResponse.prototype, "hasNext", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there is a previous page' }),
    __metadata("design:type", Boolean)
], PaginatedCategoryTreeResponse.prototype, "hasPrev", void 0);
//# sourceMappingURL=category.dto.js.map