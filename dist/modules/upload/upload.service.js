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
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const image_entity_1 = require("../../entities/image.entity");
const user_entity_1 = require("../../entities/user.entity");
const vehicle_entity_1 = require("../../entities/vehicle.entity");
const part_entity_1 = require("../../entities/part.entity");
const category_entity_1 = require("../../entities/category.entity");
const qr_code_entity_1 = require("../../entities/qr-code.entity");
const local_storage_service_1 = require("./local-storage.service");
const cloudinary_service_1 = require("./cloudinary.service");
const entity_enum_1 = require("../../common/enum/entity.enum");
let UploadService = UploadService_1 = class UploadService {
    constructor(imageRepository, userRepository, vehicleRepository, partRepository, categoryRepository, qrCodeRepository, localStorageService, cloudinaryService, configService) {
        this.imageRepository = imageRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.partRepository = partRepository;
        this.categoryRepository = categoryRepository;
        this.qrCodeRepository = qrCodeRepository;
        this.localStorageService = localStorageService;
        this.cloudinaryService = cloudinaryService;
        this.configService = configService;
        this.logger = new common_1.Logger(UploadService_1.name);
        this.isProduction = this.configService.get('NODE_ENV') === 'production';
    }
    getStorageService() {
        return this.isProduction ? this.cloudinaryService : this.localStorageService;
    }
    async validateEntity(entityType, entityId) {
        let exists = false;
        try {
            switch (entityType) {
                case entity_enum_1.ImageEnum.USER_PROFILE:
                    exists = await this.userRepository.exist({ where: { id: entityId } });
                    break;
                case entity_enum_1.ImageEnum.VEHICLE:
                    exists = await this.vehicleRepository.exist({ where: { id: entityId } });
                    break;
                case entity_enum_1.ImageEnum.PART:
                    exists = await this.partRepository.exist({ where: { id: entityId } });
                    break;
                case entity_enum_1.ImageEnum.CATEGORY:
                    exists = await this.categoryRepository.exist({ where: { id: entityId } });
                    break;
                case entity_enum_1.ImageEnum.QR_CODE:
                    exists = await this.qrCodeRepository.exist({ where: { id: entityId } });
                    break;
            }
            if (!exists) {
                throw new common_1.NotFoundException(`Entity ${entityType} with ID ${entityId} not found`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to validate entity: ${entityType} - ${entityId}`, error);
            throw error;
        }
    }
    async getEntityRelation(entityType, entityId) {
        const relations = {};
        switch (entityType) {
            case entity_enum_1.ImageEnum.USER_PROFILE:
                relations.user = { id: entityId };
                break;
            case entity_enum_1.ImageEnum.VEHICLE:
                relations.vehicle = { id: entityId };
                break;
            case entity_enum_1.ImageEnum.PART:
                relations.part = { id: entityId };
                break;
            case entity_enum_1.ImageEnum.CATEGORY:
                relations.category = { id: entityId };
                break;
            case entity_enum_1.ImageEnum.QR_CODE:
                relations.qrCode = { id: entityId };
                break;
        }
        return relations;
    }
    async uploadSingleImage(file, entityType, entityId, createdBy) {
        try {
            if (!file) {
                throw new common_1.BadRequestException('No file provided');
            }
            const maxSize = this.configService.get('MAX_FILE_SIZE') || 10485760;
            if (file.size > maxSize) {
                throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${maxSize} bytes`);
            }
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new common_1.BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
            }
            await this.validateEntity(entityType, entityId);
            const storageService = this.getStorageService();
            const uploadResult = await storageService.uploadFile(file, entityType, entityId);
            const entityRelations = await this.getEntityRelation(entityType, entityId);
            const imageData = {
                url: uploadResult.url,
                publicId: uploadResult.publicId,
                format: uploadResult.format,
                size: uploadResult.size,
                type: entityType,
                createdBy: { id: createdBy },
            };
            const image = this.imageRepository.create(Object.assign({}, imageData, entityRelations));
            const savedImage = await this.imageRepository.save(image);
            const imageWithRelations = await this.imageRepository.findOne({
                where: { id: savedImage.id },
                relations: ['createdBy'],
            });
            return this.mapToResponseDto(imageWithRelations);
        }
        catch (error) {
            this.logger.error('Failed to upload single image', error);
            throw error;
        }
    }
    async uploadMultipleImages(files, entityType, entityId, uploadedBy) {
        try {
            if (!files || files.length === 0) {
                throw new common_1.BadRequestException('No files provided');
            }
            await this.validateEntity(entityType, entityId);
            const uploadedImages = [];
            let totalSize = 0;
            for (const file of files) {
                const uploadedImage = await this.uploadSingleImage(file, entityType, entityId, uploadedBy);
                uploadedImages.push(uploadedImage);
                totalSize += uploadedImage.size;
            }
            return {
                images: uploadedImages,
                count: uploadedImages.length,
                totalSize,
            };
        }
        catch (error) {
            this.logger.error('Failed to upload multiple images', error);
            throw error;
        }
    }
    async getImageById(id) {
        try {
            const image = await this.imageRepository.findOne({
                where: { id },
                relations: ['createdBy', 'user', 'vehicle', 'part', 'category', 'qrCode'],
            });
            if (!image) {
                throw new common_1.NotFoundException(`Image with ID ${id} not found`);
            }
            return this.mapToResponseDto(image);
        }
        catch (error) {
            this.logger.error(`Failed to get image by ID: ${id}`, error);
            throw error;
        }
    }
    async deleteImage(id) {
        try {
            const image = await this.imageRepository.findOne({ where: { id } });
            if (!image) {
                throw new common_1.NotFoundException(`Image with ID ${id} not found`);
            }
            const storageService = this.getStorageService();
            await storageService.deleteFile(image.id);
            await this.imageRepository.remove(image);
            this.logger.log(`Image ${id} deleted successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to delete image: ${id}`, error);
            throw error;
        }
    }
    mapToResponseDto(image) {
        return {
            id: image.id,
            url: image.url,
            entityType: image.type,
            entityId: this.getEntityIdFromImage(image),
            createdAt: image.createdAt,
            updatedAt: image.updatedAt,
        };
    }
    getEntityIdFromImage(image) {
        if (image.user)
            return image.user.id;
        if (image.vehicle)
            return image.vehicle.id;
        if (image.part)
            return image.part.id;
        if (image.category)
            return image.category.id;
        if (image.qrCode)
            return image.qrCode.id;
        return '';
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(image_entity_1.Image)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __param(3, (0, typeorm_1.InjectRepository)(part_entity_1.Part)),
    __param(4, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(5, (0, typeorm_1.InjectRepository)(qr_code_entity_1.QrCode)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        local_storage_service_1.LocalStorageService,
        cloudinary_service_1.CloudinaryService,
        config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map