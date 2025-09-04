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
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const upload_service_1 = require("./upload.service");
const entity_enum_1 = require("../../common/enum/entity.enum");
const entity_enum_2 = require("../../common/enum/entity.enum");
const upload_dto_1 = require("../../dto/request/upload.dto");
const upload_dto_2 = require("../../dto/response/upload.dto");
const validateImageMimeType = (file) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }
    return true;
};
let UploadController = class UploadController {
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    async uploadImage(file, uploadDto) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        validateImageMimeType(file);
        if (!uploadDto.type) {
            throw new common_1.BadRequestException('Image type is required');
        }
        if (!Object.values(entity_enum_1.ImageEnum).includes(uploadDto.type)) {
            throw new common_1.BadRequestException('Invalid image type');
        }
        const result = await this.uploadService.uploadImage(file, uploadDto.type, uploadDto.entityId, uploadDto.entityType);
        return {
            message: 'Image uploaded successfully',
            data: result,
        };
    }
    async updateImage(id, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        validateImageMimeType(file);
        const existingImage = await this.uploadService.getImageById(id);
        if (!existingImage) {
            throw new common_1.BadRequestException('Image not found');
        }
        const result = await this.uploadService.updateImage(id, file, existingImage.type);
        return {
            message: 'Image updated successfully',
            data: result,
        };
    }
    async deleteImage(id) {
        await this.uploadService.deleteImage(id);
        return {
            message: 'Image deleted successfully',
        };
    }
    async uploadMultipleImages(files, uploadDto) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files uploaded');
        }
        if (!uploadDto.type) {
            throw new common_1.BadRequestException('Image type is required');
        }
        for (const file of files) {
            validateImageMimeType(file);
        }
        const results = [];
        for (const file of files) {
            try {
                const result = await this.uploadService.uploadImage(file, uploadDto.type, uploadDto.entityId, uploadDto.entityType);
                results.push({ data: result });
            }
            catch (error) {
                results.push({
                    error: error.message,
                    filename: file.originalname,
                });
            }
        }
        return {
            message: 'Bulk upload completed',
            data: results,
        };
    }
    async replaceEntityImages(files, uploadDto) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files uploaded');
        }
        if (!uploadDto.entityId || !uploadDto.entityType) {
            throw new common_1.BadRequestException('Entity ID and type are required');
        }
        for (const file of files) {
            validateImageMimeType(file);
        }
        const result = await this.uploadService.replaceEntityImages(files, uploadDto.type, uploadDto.entityId, uploadDto.entityType);
        return {
            message: 'Entity images replaced successfully',
            data: result.successful.map(res => ({ data: res })),
        };
    }
    async deleteEntityImages(entityType, entityId) {
        await this.uploadService.deleteAllEntityImages(entityId, entityType);
        return {
            message: 'All entity images deleted successfully',
        };
    }
    async getUploadStats() {
        const stats = await this.uploadService.getImageStats();
        return {
            message: 'Upload statistics retrieved successfully',
            data: stats,
        };
    }
    async getImagesByType(type) {
        const images = await this.uploadService.getImagesByType(type);
        return {
            message: 'Images retrieved successfully',
            data: images,
        };
    }
    async getImagesByEntity(entityType, entityId) {
        const images = await this.uploadService.getImagesByEntity(entityId, entityType);
        return {
            message: 'Images retrieved successfully',
            data: images,
        };
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload a new image',
        description: 'Upload a single image file with metadata. File must be under 5MB and in supported image format (jpg, jpeg, png, gif, webp).',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['file', 'type'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file to upload (max 5MB)',
                },
                type: {
                    type: 'string',
                    enum: Object.values(entity_enum_1.ImageEnum),
                    description: 'Type of image being uploaded',
                    example: entity_enum_1.ImageEnum.USER_PROFILE,
                },
                entityId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID of the entity this image belongs to (optional)',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                },
                entityType: {
                    type: 'string',
                    enum: ['user', 'vehicle', 'part'],
                    description: 'Type of entity this image belongs to (optional)',
                    example: 'user',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Image uploaded successfully',
        type: upload_dto_2.UploadResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
    }))),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_dto_1.UploadImageDto]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Put)('image/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({
        summary: 'Update an existing image',
        description: 'Replace an existing image with a new one. File must be under 5MB and in supported image format (jpg, jpeg, png, gif, webp).',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'New image file to replace the existing one (max 5MB)',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Image updated successfully',
        type: upload_dto_2.UploadResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Image not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "updateImage", null);
__decorate([
    (0, common_1.Delete)('image/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete an image',
        description: 'Permanently delete an image from storage and database.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Image deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Image not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Post)('image/bulk'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload multiple images',
        description: 'Upload multiple image files with metadata. Each file must be under 5MB and in supported image format (jpg, jpeg, png, gif, webp). Admin, Manager, or Dev role required.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['files', 'type'],
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    description: 'Multiple image files to upload (max 5MB each). Use the same field name "files" for each file.',
                },
                type: {
                    type: 'string',
                    enum: Object.values(entity_enum_1.ImageEnum),
                    description: 'Type of image being uploaded',
                    example: entity_enum_1.ImageEnum.VEHICLE,
                },
                entityId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID of the entity these images belong to (optional)',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                },
                entityType: {
                    type: 'string',
                    enum: ['user', 'vehicle', 'part'],
                    description: 'Type of entity these images belong to (optional)',
                    example: 'vehicle',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Images uploaded successfully',
        type: upload_dto_2.BulkUploadResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, roles_decorator_1.Roles)(entity_enum_2.UserRoleEnum.ADMIN, entity_enum_2.UserRoleEnum.MANAGER, entity_enum_2.UserRoleEnum.DEV),
    __param(0, (0, common_1.UploadedFiles)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
    }))),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, upload_dto_1.BulkUploadDto]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadMultipleImages", null);
__decorate([
    (0, common_1.Post)('image/bulk/entity'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    (0, swagger_1.ApiOperation)({
        summary: 'Replace all images for an entity',
        description: 'Delete all existing images for an entity and upload new ones. Admin, Manager, or Dev role required.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['files', 'type', 'entityId', 'entityType'],
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    description: 'New image files to upload (max 5MB each)',
                },
                type: {
                    type: 'string',
                    enum: Object.values(entity_enum_1.ImageEnum),
                    description: 'Type of image being uploaded',
                    example: entity_enum_1.ImageEnum.VEHICLE,
                },
                entityId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID of the entity',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                },
                entityType: {
                    type: 'string',
                    enum: ['user', 'vehicle', 'part'],
                    description: 'Type of entity',
                    example: 'vehicle',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Entity images replaced successfully',
        type: upload_dto_2.BulkUploadResponseDto,
    }),
    (0, roles_decorator_1.Roles)(entity_enum_2.UserRoleEnum.ADMIN, entity_enum_2.UserRoleEnum.MANAGER, entity_enum_2.UserRoleEnum.DEV),
    __param(0, (0, common_1.UploadedFiles)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
    }))),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, upload_dto_1.BulkUploadDto]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "replaceEntityImages", null);
__decorate([
    (0, common_1.Delete)('image/entity/:entityType/:entityId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete all images for an entity',
        description: 'Delete all images associated with a specific entity.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Entity images deleted successfully' }),
    (0, roles_decorator_1.Roles)(entity_enum_2.UserRoleEnum.ADMIN, entity_enum_2.UserRoleEnum.MANAGER, entity_enum_2.UserRoleEnum.DEV),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "deleteEntityImages", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upload statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statistics retrieved successfully',
        type: upload_dto_2.UploadStatsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, roles_decorator_1.Roles)(entity_enum_2.UserRoleEnum.ADMIN, entity_enum_2.UserRoleEnum.MANAGER, entity_enum_2.UserRoleEnum.DEV),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getUploadStats", null);
__decorate([
    (0, common_1.Get)('images/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Get images by type' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Images retrieved successfully',
        type: upload_dto_2.ImagesResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getImagesByType", null);
__decorate([
    (0, common_1.Get)('images/entity/:entityType/:entityId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get images by entity' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Images retrieved successfully',
        type: upload_dto_2.ImagesResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getImagesByEntity", null);
exports.UploadController = UploadController = __decorate([
    (0, swagger_1.ApiTags)('Upload'),
    (0, common_1.Controller)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [upload_service_1.UploadService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map