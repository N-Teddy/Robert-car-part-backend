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
const user_entity_1 = require("../../entities/user.entity");
const vehicle_entity_1 = require("../../entities/vehicle.entity");
const part_entity_1 = require("../../entities/part.entity");
let UploadService = UploadService_1 = class UploadService {
    constructor(configService, cloudinaryService, localStorageService, imageRepository, userRepository, vehicleRepository, partRepository, dataSource) {
        this.configService = configService;
        this.cloudinaryService = cloudinaryService;
        this.localStorageService = localStorageService;
        this.imageRepository = imageRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.partRepository = partRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(UploadService_1.name);
    }
    async uploadImage(file, imageType, entityId, entityType) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const isProduction = this.configService.get('app.environment') === 'production';
            let uploadResult;
            if (isProduction) {
                uploadResult = await this.cloudinaryService.uploadImage(file, imageType);
            }
            else {
                uploadResult = await this.localStorageService.uploadImage(file, imageType);
            }
            const image = this.imageRepository.create({
                url: uploadResult.url,
                type: imageType,
            });
            if (entityId && entityType) {
                await this.setEntityRelationship(image, entityType, entityId, queryRunner);
            }
            const savedImage = await queryRunner.manager.save(image_entity_1.Image, image);
            await queryRunner.commitTransaction();
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
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to upload image: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to upload image: ${error.message}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async setEntityRelationship(image, entityType, entityId, queryRunner) {
        switch (entityType.toLowerCase()) {
            case 'user':
                await this.handleUserRelationship(image, entityId, queryRunner);
                break;
            case 'vehicle':
                await this.handleVehicleRelationship(image, entityId, queryRunner);
                break;
            case 'part':
                await this.handlePartRelationship(image, entityId, queryRunner);
                break;
            default:
                throw new common_1.BadRequestException(`Unsupported entity type: ${entityType}`);
        }
    }
    async handleUserRelationship(image, userId, queryRunner) {
        const user = await queryRunner.manager.findOne(user_entity_1.User, {
            where: { id: userId },
            relations: ['profileImage']
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.profileImage) {
            await this.deleteImage(user.profileImage.id);
        }
        image.user = user;
        user.profileImage = image;
        await queryRunner.manager.save(user_entity_1.User, user);
    }
    async handleVehicleRelationship(image, vehicleId, queryRunner) {
        const vehicle = await queryRunner.manager.findOne(vehicle_entity_1.Vehicle, {
            where: { id: vehicleId }
        });
        if (!vehicle) {
            throw new common_1.BadRequestException('Vehicle not found');
        }
        image.vehicle = vehicle;
    }
    async handlePartRelationship(image, partId, queryRunner) {
        const part = await queryRunner.manager.findOne(part_entity_1.Part, {
            where: { id: partId }
        });
        if (!part) {
            throw new common_1.BadRequestException('Part not found');
        }
        image.part = part;
    }
    async updateImage(imageId, file, imageType) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const image = await queryRunner.manager.findOne(image_entity_1.Image, {
                where: { id: imageId },
                relations: ['user']
            });
            if (!image) {
                throw new common_1.BadRequestException('Image not found');
            }
            const isProduction = this.configService.get('app.environment') === 'production';
            let uploadResult;
            if (isProduction) {
                uploadResult = await this.cloudinaryService.uploadImage(file, imageType);
                await this.cloudinaryService.deleteImage(image.url).catch(error => {
                    this.logger.warn(`Failed to delete old cloudinary image: ${error.message}`);
                });
            }
            else {
                const localPath = this.convertUrlToLocalPath(image.url);
                if (localPath) {
                    uploadResult = await this.localStorageService.updateImage(localPath, file, imageType);
                }
                else {
                    uploadResult = await this.localStorageService.uploadImage(file, imageType);
                }
            }
            image.url = uploadResult.url;
            image.type = imageType;
            const updatedImage = await queryRunner.manager.save(image_entity_1.Image, image);
            await queryRunner.commitTransaction();
            this.logger.log(`Image updated successfully: ${imageId}`);
            return {
                url: uploadResult.url,
                imageId: updatedImage.id,
                type: imageType,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to update image: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to update image: ${error.message}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    convertUrlToLocalPath(url) {
        try {
            if (url.includes('localhost:3000/uploads')) {
                return url.replace('http://localhost:3000/uploads', './uploads');
            }
            return null;
        }
        catch {
            return null;
        }
    }
    async getImagesByType(type) {
        return this.imageRepository.find({
            where: { type },
            relations: ['user', 'vehicle', 'part']
        });
    }
    async getImagesByEntity(entityId, entityType) {
        const whereClause = {};
        switch (entityType.toLowerCase()) {
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
        return this.imageRepository.find({
            where: whereClause,
            relations: ['user', 'vehicle', 'part']
        });
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
    async uploadMultipleImages(files, imageType, entityId, entityType) {
        const results = {
            successful: [],
            failed: []
        };
        for (const file of files) {
            try {
                const result = await this.uploadImage(file, imageType, entityId, entityType);
                results.successful.push(result);
            }
            catch (error) {
                results.failed.push({
                    error: error.message,
                    file: file
                });
                this.logger.error(`Failed to upload image: ${error.message}`);
            }
        }
        return results;
    }
    async updateMultipleImages(updates) {
        const results = {
            successful: [],
            failed: []
        };
        for (const update of updates) {
            try {
                const result = await this.updateImage(update.imageId, update.file, update.imageType);
                results.successful.push({
                    imageId: update.imageId,
                    url: result.url
                });
            }
            catch (error) {
                results.failed.push({
                    imageId: update.imageId,
                    error: error.message
                });
                this.logger.error(`Failed to update image ${update.imageId}: ${error.message}`);
            }
        }
        return results;
    }
    async replaceEntityImages(files, imageType, entityId, entityType) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await this.deleteAllEntityImages(entityId, entityType, queryRunner);
            const results = await this.uploadMultipleImages(files, imageType, entityId, entityType);
            await queryRunner.commitTransaction();
            return results;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to replace entity images: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to replace entity images: ${error.message}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async deleteAllEntityImages(entityId, entityType, queryRunner) {
        const useExternalRunner = !!queryRunner;
        const localQueryRunner = queryRunner || this.dataSource.createQueryRunner();
        if (!useExternalRunner) {
            await localQueryRunner.connect();
            await localQueryRunner.startTransaction();
        }
        try {
            const images = await this.getImagesByEntity(entityId, entityType);
            for (const image of images) {
                await this.deleteImage(image.id, localQueryRunner);
            }
            if (!useExternalRunner) {
                await localQueryRunner.commitTransaction();
            }
        }
        catch (error) {
            if (!useExternalRunner) {
                await localQueryRunner.rollbackTransaction();
            }
            this.logger.error(`Failed to delete entity images: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to delete entity images: ${error.message}`);
        }
        finally {
            if (!useExternalRunner) {
                await localQueryRunner.release();
            }
        }
    }
    async deleteMultipleImages(imageIds) {
        const results = {
            deleted: [],
            failed: []
        };
        for (const imageId of imageIds) {
            try {
                await this.deleteImage(imageId);
                results.deleted.push(imageId);
            }
            catch (error) {
                results.failed.push(imageId);
                this.logger.error(`Failed to delete image ${imageId}: ${error.message}`);
            }
        }
        return results;
    }
    async reorderEntityImages(entityId, entityType, imageIdsInOrder) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const images = await this.getImagesByEntity(entityId, entityType);
            const entityImageIds = images.map(img => img.id);
            const invalidIds = imageIdsInOrder.filter(id => !entityImageIds.includes(id));
            if (invalidIds.length > 0) {
                throw new common_1.BadRequestException(`Invalid image IDs: ${invalidIds.join(', ')}`);
            }
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to reorder images: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to reorder images: ${error.message}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async setPrimaryImage(imageId, entityId, entityType) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const image = await queryRunner.manager.findOne(image_entity_1.Image, {
                where: { id: imageId },
                relations: [entityType]
            });
            if (!image) {
                throw new common_1.BadRequestException('Image not found');
            }
            const entityField = image[entityType];
            if (!entityField ||
                typeof entityField !== 'object' ||
                entityField === null ||
                !('id' in entityField) ||
                entityField.id !== entityId) {
                throw new common_1.BadRequestException('Image does not belong to the specified entity');
            }
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to set primary image: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to set primary image: ${error.message}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async getImageById(imageId) {
        try {
            const image = await this.imageRepository.findOne({
                where: { id: imageId },
                relations: ['user', 'vehicle', 'part']
            });
            if (!image) {
                throw new common_1.BadRequestException('Image not found');
            }
            return image;
        }
        catch (error) {
            this.logger.error(`Failed to get image: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to get image: ${error.message}`);
        }
    }
    async deleteImage(imageId, queryRunner) {
        const useExternalRunner = !!queryRunner;
        const localQueryRunner = queryRunner || this.dataSource.createQueryRunner();
        if (!useExternalRunner) {
            await localQueryRunner.connect();
            await localQueryRunner.startTransaction();
        }
        try {
            const image = await localQueryRunner.manager.findOne(image_entity_1.Image, {
                where: { id: imageId },
                relations: ['user']
            });
            if (!image) {
                throw new common_1.BadRequestException('Image not found');
            }
            const isProduction = this.configService.get('app.environment') === 'production';
            if (isProduction) {
                await this.cloudinaryService.deleteImage(image.url);
            }
            else {
                const localPath = this.convertUrlToLocalPath(image.url);
                if (localPath) {
                    await this.localStorageService.deleteImage(localPath);
                }
            }
            if (image.user) {
                image.user.profileImage = null;
                await localQueryRunner.manager.save(user_entity_1.User, image.user);
            }
            await localQueryRunner.manager.remove(image_entity_1.Image, image);
            if (!useExternalRunner) {
                await localQueryRunner.commitTransaction();
            }
            this.logger.log(`Image deleted successfully: ${imageId}`);
        }
        catch (error) {
            if (!useExternalRunner) {
                await localQueryRunner.rollbackTransaction();
            }
            this.logger.error(`Failed to delete image: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to delete image: ${error.message}`);
        }
        finally {
            if (!useExternalRunner) {
                await localQueryRunner.release();
            }
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(image_entity_1.Image)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(5, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __param(6, (0, typeorm_1.InjectRepository)(part_entity_1.Part)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        cloudinary_service_1.CloudinaryService,
        local_storage_service_1.LocalStorageService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], UploadService);
//# sourceMappingURL=upload.service.js.map