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
var PartService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const part_entity_1 = require("../../entities/part.entity");
const vehicle_entity_1 = require("../../entities/vehicle.entity");
const category_entity_1 = require("../../entities/category.entity");
const qr_code_entity_1 = require("../../entities/qr-code.entity");
const image_entity_1 = require("../../entities/image.entity");
const part_dto_1 = require("../../dto/response/part.dto");
const upload_service_1 = require("../upload/upload.service");
const notification_service_1 = require("../notification/notification.service");
const entity_enum_1 = require("../../common/enum/entity.enum");
const notification_enum_1 = require("../../common/enum/notification.enum");
const QRCode = require("qrcode");
let PartService = PartService_1 = class PartService {
    constructor(partRepository, vehicleRepository, categoryRepository, qrCodeRepository, imageRepository, uploadService, notificationService) {
        this.partRepository = partRepository;
        this.vehicleRepository = vehicleRepository;
        this.categoryRepository = categoryRepository;
        this.qrCodeRepository = qrCodeRepository;
        this.imageRepository = imageRepository;
        this.uploadService = uploadService;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(PartService_1.name);
    }
    async create(dto, imageFiles, userId) {
        try {
            const vehicle = await this.vehicleRepository.findOne({
                where: { id: dto.vehicleId },
            });
            if (!vehicle) {
                throw new common_1.NotFoundException('Vehicle not found');
            }
            const category = await this.categoryRepository.findOne({
                where: { id: dto.categoryId },
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
            const part = this.partRepository.create({
                ...dto,
                vehicle: { id: dto.vehicleId },
                category: { id: dto.categoryId },
                createdBy: userId,
            });
            const savedPart = await this.partRepository.save(part);
            await this.generateQrCodeForPart(savedPart, userId);
            if (imageFiles && imageFiles.length > 0) {
                await Promise.all(imageFiles.map((file) => this.uploadService.uploadSingleImage(file, entity_enum_1.ImageEnum.PART, savedPart.id, userId)));
            }
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.PART_CREATED,
                title: 'New Part Added',
                message: `Part "${dto.name}" has been added to the system.`,
                audience: notification_enum_1.NotificationAudienceEnum.ADMIN,
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
                metadata: {
                    partId: savedPart.id,
                    partName: dto.name,
                    vehicleId: dto.vehicleId,
                    categoryId: dto.categoryId,
                    price: dto.price,
                    quantity: dto.quantity,
                },
            });
            const partWithRelations = await this.partRepository.findOne({
                where: { id: savedPart.id },
                relations: [
                    'images',
                    'vehicle',
                    'category',
                    'qrCode',
                    'qrCode.image',
                ],
            });
            return part_dto_1.PartResponseDto.fromEntity(partWithRelations);
        }
        catch (error) {
            this.logger.error('Failed to create part', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create part');
        }
    }
    async generateQrCodeForPart(part, userId) {
        try {
            const qrData = JSON.stringify({
                partId: part.id,
                name: part.name,
                partNumber: part.partNumber,
                price: part.price,
                createdAt: new Date().toISOString(),
            });
            const qrCodeBuffer = await QRCode.toBuffer(qrData, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
            const qrCode = this.qrCodeRepository.create({
                data: qrData,
                encodedData: qrData,
                part: { id: part.id },
            });
            const savedQrCode = await this.qrCodeRepository.save(qrCode);
            const mockFile = {
                originalname: `qr-code-${part.id}.png`,
                mimetype: 'image/png',
                buffer: qrCodeBuffer,
                size: qrCodeBuffer.length,
            };
            const uploadedImage = await this.uploadService.uploadSingleImage(mockFile, entity_enum_1.ImageEnum.QR_CODE, savedQrCode.id, userId);
            await this.imageRepository.update(uploadedImage.id, {
                qrCode: { id: savedQrCode.id },
            });
            this.logger.log(`QR code generated for part ${part.id}`);
        }
        catch (error) {
            this.logger.error('Failed to generate QR code for part', error);
        }
    }
    async findAll(page = 1, limit = 10, search, vehicleId, categoryId, minPrice, maxPrice, minQuantity, maxQuantity, condition) {
        try {
            const skip = (page - 1) * limit;
            const query = this.partRepository
                .createQueryBuilder('part')
                .leftJoinAndSelect('part.images', 'images')
                .leftJoinAndSelect('part.vehicle', 'vehicle')
                .leftJoinAndSelect('part.category', 'category')
                .leftJoinAndSelect('part.qrCode', 'qrCode')
                .leftJoinAndSelect('qrCode.image', 'qrCodeImage')
                .orderBy('part.createdAt', 'DESC');
            if (search) {
                query.where('(part.name ILIKE :search OR part.description ILIKE :search OR part.partNumber ILIKE :search)', {
                    search: `%${search}%`,
                });
            }
            if (vehicleId) {
                query.andWhere('part.vehicleId = :vehicleId', { vehicleId });
            }
            if (categoryId) {
                query.andWhere('part.categoryId = :categoryId', { categoryId });
            }
            if (minPrice !== undefined && maxPrice !== undefined) {
                query.andWhere('part.price BETWEEN :minPrice AND :maxPrice', {
                    minPrice,
                    maxPrice,
                });
            }
            else if (minPrice !== undefined) {
                query.andWhere('part.price >= :minPrice', { minPrice });
            }
            else if (maxPrice !== undefined) {
                query.andWhere('part.price <= :maxPrice', { maxPrice });
            }
            if (minQuantity !== undefined && maxQuantity !== undefined) {
                query.andWhere('part.quantity BETWEEN :minQuantity AND :maxQuantity', { minQuantity, maxQuantity });
            }
            else if (minQuantity !== undefined) {
                query.andWhere('part.quantity >= :minQuantity', {
                    minQuantity,
                });
            }
            else if (maxQuantity !== undefined) {
                query.andWhere('part.quantity <= :maxQuantity', {
                    maxQuantity,
                });
            }
            if (condition) {
                query.andWhere('part.condition = :condition', { condition });
            }
            const [parts, total] = await query
                .skip(skip)
                .take(limit)
                .getManyAndCount();
            const totalPages = Math.ceil(total / limit);
            const hasNext = page < totalPages;
            const hasPrev = page > 1;
            return {
                data: parts.map(part_dto_1.PartResponseDto.fromEntity),
                total,
                page,
                limit,
                totalPages,
                hasNext,
                hasPrev,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch parts', error);
            throw new common_1.InternalServerErrorException('Failed to fetch parts');
        }
    }
    async findOne(id) {
        try {
            const part = await this.partRepository.findOne({
                where: { id },
                relations: [
                    'images',
                    'vehicle',
                    'category',
                    'qrCode',
                    'qrCode.image',
                    'orderItems',
                ],
            });
            if (!part) {
                throw new common_1.NotFoundException('Part not found');
            }
            return part_dto_1.PartResponseDto.fromEntity(part);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to fetch part');
        }
    }
    async update(id, dto, imageFiles, userId) {
        try {
            const part = await this.partRepository.findOne({
                where: { id },
                relations: ['images', 'vehicle', 'category'],
            });
            if (!part) {
                throw new common_1.NotFoundException('Part not found');
            }
            if (dto.vehicleId) {
                const vehicle = await this.vehicleRepository.findOne({
                    where: { id: dto.vehicleId },
                });
                if (!vehicle) {
                    throw new common_1.NotFoundException('Vehicle not found');
                }
            }
            if (dto.categoryId) {
                const category = await this.categoryRepository.findOne({
                    where: { id: dto.categoryId },
                });
                if (!category) {
                    throw new common_1.NotFoundException('Category not found');
                }
            }
            Object.assign(part, dto);
            if (dto.vehicleId)
                part.vehicle = { id: dto.vehicleId };
            if (dto.categoryId)
                part.category = { id: dto.categoryId };
            const savedPart = await this.partRepository.save(part);
            if (imageFiles && imageFiles.length > 0) {
                await Promise.all(imageFiles.map((file) => this.uploadService.uploadSingleImage(file, entity_enum_1.ImageEnum.PART, savedPart.id, userId)));
            }
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.PART_UPDATED,
                title: 'Part Updated',
                message: `Part "${part.name}" has been updated.`,
                audience: notification_enum_1.NotificationAudienceEnum.ADMIN,
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
                metadata: {
                    partId: savedPart.id,
                    partName: part.name,
                    vehicleId: part.vehicle?.id,
                    categoryId: part.category?.id,
                },
            });
            const updatedPart = await this.partRepository.findOne({
                where: { id: savedPart.id },
                relations: [
                    'images',
                    'vehicle',
                    'category',
                    'qrCode',
                    'qrCode.image',
                ],
            });
            return part_dto_1.PartResponseDto.fromEntity(updatedPart);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update part');
        }
    }
    async remove(id, userId) {
        const queryRunner = this.partRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const part = await queryRunner.manager.findOne(part_entity_1.Part, {
                where: { id },
                relations: ['images', 'orderItems', 'qrCode', 'qrCode.image'],
            });
            if (!part) {
                throw new common_1.NotFoundException('Part not found');
            }
            if (part.orderItems && part.orderItems.length > 0) {
                throw new common_1.BadRequestException('Cannot delete part with associated orders');
            }
            if (part.qrCode) {
                if (part.qrCode.image) {
                    await this.uploadService.deleteImage(part.qrCode.image.id);
                }
            }
            if (part.images && part.images.length > 0) {
                for (const image of part.images) {
                    await this.uploadService.deleteImage(image.id);
                }
            }
            await queryRunner.manager.delete(part_entity_1.Part, id);
            await queryRunner.commitTransaction();
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.PART_DELETED,
                title: 'Part Deleted',
                message: `Part "${part.name}" has been deleted.`,
                audience: notification_enum_1.NotificationAudienceEnum.ADMIN,
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
                metadata: {
                    partId: id,
                    partName: part.name,
                },
            });
            return { success: true };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Failed to delete part', error);
            throw new common_1.InternalServerErrorException('Failed to delete part');
        }
        finally {
            await queryRunner.release();
        }
    }
    async getStatistics() {
        try {
            const totalParts = await this.partRepository.count();
            const lowStockParts = await this.partRepository.count({
                where: { quantity: (0, typeorm_2.LessThanOrEqual)(5) },
            });
            const outOfStockParts = await this.partRepository.count({
                where: { quantity: 0 },
            });
            const totalValue = await this.partRepository
                .createQueryBuilder('part')
                .select('SUM(part.price * part.quantity)', 'totalValue')
                .getRawOne();
            return {
                totalParts,
                lowStockParts,
                outOfStockParts,
                totalValue: parseFloat(totalValue.totalValue) || 0,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch part statistics', error);
            throw new common_1.InternalServerErrorException('Failed to fetch part statistics');
        }
    }
    async getCategoryStatistics() {
        try {
            const categoryStats = await this.partRepository
                .createQueryBuilder('part')
                .leftJoin('part.category', 'category')
                .select('category.name', 'categoryName')
                .addSelect('COUNT(part.id)', 'count')
                .addSelect('SUM(part.price * part.quantity)', 'totalValue')
                .groupBy('category.name')
                .orderBy('count', 'DESC')
                .getRawMany();
            return categoryStats;
        }
        catch (error) {
            this.logger.error('Failed to fetch category statistics', error);
            throw new common_1.InternalServerErrorException('Failed to fetch category statistics');
        }
    }
    async getLowStockParts() {
        try {
            const lowStockParts = await this.partRepository.find({
                where: { quantity: (0, typeorm_2.LessThanOrEqual)(5) },
                relations: ['images', 'vehicle', 'category'],
                order: { quantity: 'ASC' },
                take: 20,
            });
            return lowStockParts.map(part_dto_1.PartResponseDto.fromEntity);
        }
        catch (error) {
            this.logger.error('Failed to fetch low stock parts', error);
            throw new common_1.InternalServerErrorException('Failed to fetch low stock parts');
        }
    }
};
exports.PartService = PartService;
exports.PartService = PartService = PartService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(part_entity_1.Part)),
    __param(1, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __param(2, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(3, (0, typeorm_1.InjectRepository)(qr_code_entity_1.QrCode)),
    __param(4, (0, typeorm_1.InjectRepository)(image_entity_1.Image)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        upload_service_1.UploadService,
        notification_service_1.NotificationService])
], PartService);
//# sourceMappingURL=part.service.js.map