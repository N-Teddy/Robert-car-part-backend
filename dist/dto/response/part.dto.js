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
exports.PartResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class PartResponseDto {
    static fromEntity(entity) {
        const dto = new PartResponseDto();
        dto.id = entity.id;
        dto.name = entity.name;
        dto.description = entity.description;
        dto.price = entity.price;
        dto.quantity = entity.quantity;
        dto.condition = entity.condition;
        dto.partNumber = entity.partNumber;
        dto.vehicleId = entity.vehicle?.id;
        dto.categoryId = entity.category?.id;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;
        if (entity.qrCode?.image?.url) {
            dto.qrCodeUrl = entity.qrCode.image.url;
        }
        if (entity.images && entity.images.length > 0) {
            dto.images = entity.images.map((img) => ({
                id: img.id,
                url: img.url,
                publicId: img.publicId,
                format: img.format,
            }));
        }
        return dto;
    }
}
exports.PartResponseDto = PartResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PartResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PartResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PartResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PartResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PartResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], PartResponseDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], PartResponseDto.prototype, "partNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PartResponseDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PartResponseDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], PartResponseDto.prototype, "qrCodeUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    __metadata("design:type", Array)
], PartResponseDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], PartResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], PartResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=part.dto.js.map