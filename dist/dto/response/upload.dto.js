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
exports.MultipleUploadResponseDto = exports.UploadedImageResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const entity_enum_1 = require("../../common/enum/entity.enum");
class UploadedImageResponseDto {
}
exports.UploadedImageResponseDto = UploadedImageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image ID' }),
    __metadata("design:type", String)
], UploadedImageResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image URL' }),
    __metadata("design:type", String)
], UploadedImageResponseDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Public ID for Cloudinary or file path for local' }),
    __metadata("design:type", String)
], UploadedImageResponseDto.prototype, "publicId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image format/extension' }),
    __metadata("design:type", String)
], UploadedImageResponseDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image size in bytes' }),
    __metadata("design:type", Number)
], UploadedImageResponseDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity type this image belongs to', enum: entity_enum_1.ImageEnum }),
    __metadata("design:type", String)
], UploadedImageResponseDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity ID this image belongs to' }),
    __metadata("design:type", String)
], UploadedImageResponseDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User who uploaded the image' }),
    __metadata("design:type", Object)
], UploadedImageResponseDto.prototype, "uploadedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload timestamp' }),
    __metadata("design:type", Date)
], UploadedImageResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", Date)
], UploadedImageResponseDto.prototype, "updatedAt", void 0);
class MultipleUploadResponseDto {
}
exports.MultipleUploadResponseDto = MultipleUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of uploaded images',
        type: [UploadedImageResponseDto]
    }),
    __metadata("design:type", Array)
], MultipleUploadResponseDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of images uploaded' }),
    __metadata("design:type", Number)
], MultipleUploadResponseDto.prototype, "count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total size of all uploaded images in bytes' }),
    __metadata("design:type", Number)
], MultipleUploadResponseDto.prototype, "totalSize", void 0);
//# sourceMappingURL=upload.dto.js.map