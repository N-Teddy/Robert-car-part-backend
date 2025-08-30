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
exports.ImagesResponseDto = exports.ImageDto = exports.UploadStatsResponseDto = exports.UploadStatsDto = exports.BulkUploadResponseDto = exports.BulkUploadResultDto = exports.UploadResponseDto = exports.UploadResultDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const entity_enum_1 = require("../../common/enum/entity.enum");
class UploadResultDto {
}
exports.UploadResultDto = UploadResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL of the uploaded image',
        example: 'https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image.jpg',
    }),
    __metadata("design:type", String)
], UploadResultDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier of the uploaded image',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], UploadResultDto.prototype, "imageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of the uploaded image',
        enum: entity_enum_1.ImageEnum,
        example: entity_enum_1.ImageEnum.USER_PROFILE,
    }),
    __metadata("design:type", String)
], UploadResultDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the entity this image belongs to (optional)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    }),
    __metadata("design:type", String)
], UploadResultDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of entity this image belongs to (optional)',
        example: 'user',
        required: false,
    }),
    __metadata("design:type", String)
], UploadResultDto.prototype, "entityType", void 0);
class UploadResponseDto {
}
exports.UploadResponseDto = UploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Image uploaded successfully',
    }),
    __metadata("design:type", String)
], UploadResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Upload result data',
        type: UploadResultDto,
    }),
    __metadata("design:type", UploadResultDto)
], UploadResponseDto.prototype, "data", void 0);
class BulkUploadResultDto {
}
exports.BulkUploadResultDto = BulkUploadResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Upload result for a single file',
        type: UploadResultDto,
        required: false,
    }),
    __metadata("design:type", UploadResultDto)
], BulkUploadResultDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Error message if upload failed',
        example: 'File too large',
        required: false,
    }),
    __metadata("design:type", String)
], BulkUploadResultDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Original filename',
        example: 'profile.jpg',
        required: false,
    }),
    __metadata("design:type", String)
], BulkUploadResultDto.prototype, "filename", void 0);
class BulkUploadResponseDto {
}
exports.BulkUploadResponseDto = BulkUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Bulk upload completed',
    }),
    __metadata("design:type", String)
], BulkUploadResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of upload results',
        type: [BulkUploadResultDto],
    }),
    __metadata("design:type", Array)
], BulkUploadResponseDto.prototype, "data", void 0);
class UploadStatsDto {
}
exports.UploadStatsDto = UploadStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of uploaded files',
        example: 150,
    }),
    __metadata("design:type", Number)
], UploadStatsDto.prototype, "totalFiles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total size of all uploaded files in bytes',
        example: 52428800,
    }),
    __metadata("design:type", Number)
], UploadStatsDto.prototype, "totalSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Breakdown of files by type',
        example: {
            'USER PROFILE': 25,
            'VEHICLE': 100,
            'PART': 25,
        },
    }),
    __metadata("design:type", Object)
], UploadStatsDto.prototype, "typeBreakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Storage type being used',
        example: 'cloudinary',
        enum: ['cloudinary', 'local'],
    }),
    __metadata("design:type", String)
], UploadStatsDto.prototype, "storage", void 0);
class UploadStatsResponseDto {
}
exports.UploadStatsResponseDto = UploadStatsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Upload statistics retrieved successfully',
    }),
    __metadata("design:type", String)
], UploadStatsResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Upload statistics data',
        type: UploadStatsDto,
    }),
    __metadata("design:type", UploadStatsDto)
], UploadStatsResponseDto.prototype, "data", void 0);
class ImageDto {
}
exports.ImageDto = ImageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier of the image',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], ImageDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL of the image',
        example: 'https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image.jpg',
    }),
    __metadata("design:type", String)
], ImageDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of the image',
        enum: entity_enum_1.ImageEnum,
        example: entity_enum_1.ImageEnum.USER_PROFILE,
    }),
    __metadata("design:type", String)
], ImageDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], ImageDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], ImageDto.prototype, "updatedAt", void 0);
class ImagesResponseDto {
}
exports.ImagesResponseDto = ImagesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Images retrieved successfully',
    }),
    __metadata("design:type", String)
], ImagesResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of images',
        type: [ImageDto],
    }),
    __metadata("design:type", Array)
], ImagesResponseDto.prototype, "data", void 0);
//# sourceMappingURL=upload.dto.js.map