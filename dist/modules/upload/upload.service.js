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
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const image_entity_1 = require("../../entities/image.entity");
const cloudinary_service_1 = require("./cloudinary.service");
const local_storage_service_1 = require("./local-storage.service");
let UploadService = UploadService_1 = class UploadService {
    constructor(configService, cloudinaryService, localStorageService, imageRepository) {
        this.configService = configService;
        this.cloudinaryService = cloudinaryService;
        this.localStorageService = localStorageService;
        this.imageRepository = imageRepository;
        this.logger = new common_1.Logger(UploadService_1.name);
    }
    async uploadImage(file, imageType, entityId, entityType, folder) {
        try {
            const isProduction = this.configService.get('app.environment') === 'production';
            let uploadResult;
            if (isProduction) {
                uploadResult = await this.cloudinaryService.uploadImage(file, imageType, folder);
            }
            else {
                uploadResult = await this.localStorageService.uploadImage(file, imageType, folder);
            }
            const image = this.imageRepository.create({
                url: uploadResult.url,
                type: imageType,
            });
            if (entityId && entityType) {
                switch (entityType) {
                    case 'user':
                        image.user = { id: entityId };
                        break;
                    case 'vehicle':
                        image.vehicle = { id: entityId };
                        break;
                    case 'part':
                        image.part = { id: entityId };
                        break;
                }
            }
            const savedImage = await this.imageRepository.save(image);
            this.logger.log(`Image uploaded successfully: ${savedImage.id}`);
            return {
                url: uploadResult.url,
                imageId: savedImage.id,
                type: imageType,
                entityId,
                entityType,
            };
        }
        catch (error) {
            this.logger.error(`Failed to upload image: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to upload image: ${error.message}`);
        }
    }
    async deleteImage(imageId) {
        try {
            const image = await this.imageRepository.findOne({
                where: { id: imageId },
            });
            if (!image) {
                throw new common_1.BadRequestException('Image not found');
            }
            const isProduction = this.configService.get('app.environment') === 'production';
            if (isProduction) {
                const publicId = this.extractPublicIdFromUrl(image.url);
                if (publicId) {
                    await this.cloudinaryService.deleteImage(publicId);
                }
            }
            else {
                const localPath = this.extractLocalPathFromUrl(image.url);
                if (localPath) {
                    await this.localStorageService.deleteImage(localPath);
                }
            }
            await this.imageRepository.remove(image);
            this.logger.log(`Image deleted successfully: ${imageId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete image: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to delete image: ${error.message}`);
        }
    }
    async updateImage(imageId, file, folder) {
        try {
            const image = await this.imageRepository.findOne({
                where: { id: imageId },
            });
            if (!image) {
                throw new common_1.BadRequestException('Image not found');
            }
            const isProduction = this.configService.get('app.environment') === 'production';
            let uploadResult;
            if (isProduction) {
                const publicId = this.extractPublicIdFromUrl(image.url);
                if (publicId) {
                    uploadResult = await this.cloudinaryService.updateImage(publicId, file);
                }
                else {
                    uploadResult = await this.cloudinaryService.uploadImage(file, image.type, folder);
                }
            }
            else {
                const localPath = this.extractLocalPathFromUrl(image.url);
                if (localPath) {
                    uploadResult = await this.localStorageService.updateImage(localPath, file, image.type, folder);
                }
                else {
                    uploadResult = await this.localStorageService.uploadImage(file, image.type, folder);
                }
            }
            image.url = uploadResult.url;
            const updatedImage = await this.imageRepository.save(image);
            this.logger.log(`Image updated successfully: ${imageId}`);
            return {
                url: uploadResult.url,
                imageId: updatedImage.id,
                type: updatedImage.type,
            };
        }
        catch (error) {
            this.logger.error(`Failed to update image: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to update image: ${error.message}`);
        }
    }
    async getImagesByType(type) {
        return this.imageRepository.find({ where: { type } });
    }
    async getImagesByEntity(entityId, entityType) {
        const whereClause = {};
        switch (entityType) {
            case 'user':
                whereClause.user = { id: entityId };
                break;
            case 'vehicle':
                whereClause.vehicle = { id: entityId };
                break;
            case 'part':
                whereClause.part = { id: entityId };
                break;
            default:
                throw new common_1.BadRequestException('Invalid entity type');
        }
        return this.imageRepository.find({ where: whereClause });
    }
    async getImageStats() {
        const isProduction = this.configService.get('app.environment') === 'production';
        if (isProduction) {
            const totalImages = await this.imageRepository.count();
            const typeBreakdown = await this.imageRepository
                .createQueryBuilder('image')
                .select('image.type', 'type')
                .addSelect('COUNT(*)', 'count')
                .groupBy('image.type')
                .getRawMany();
            return {
                totalFiles: totalImages,
                totalSize: 0,
                typeBreakdown: typeBreakdown.reduce((acc, item) => {
                    acc[item.type] = parseInt(item.count);
                    return acc;
                }, {}),
                storage: 'cloudinary',
            };
        }
        else {
            const stats = await this.localStorageService.getImageStats();
            return {
                ...stats,
                storage: 'local',
            };
        }
    }
    extractPublicIdFromUrl(url) {
        try {
            const match = url.match(/\/v\d+\/([^\/]+)\./);
            return match ? match[1] : null;
        }
        catch {
            return null;
        }
    }
    extractLocalPathFromUrl(url) {
        try {
            const match = url.match(/\/uploads\/(.+)/);
            return match ? `./uploads/${match[1]}` : null;
        }
        catch {
            return null;
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(image_entity_1.Image)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        cloudinary_service_1.CloudinaryService,
        local_storage_service_1.LocalStorageService,
        typeorm_2.Repository])
], UploadService);
//# sourceMappingURL=upload.service.js.map