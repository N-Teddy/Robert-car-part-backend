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
var VehicleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vehicle_entity_1 = require("../../entities/vehicle.entity");
const image_entity_1 = require("../../entities/image.entity");
const vehicle_dto_1 = require("../../dto/response/vehicle.dto");
const upload_service_1 = require("../upload/upload.service");
const notification_service_1 = require("../notification/notification.service");
const entity_enum_1 = require("../../common/enum/entity.enum");
const notification_enum_1 = require("../../common/enum/notification.enum");
const vehicle_profit_entity_1 = require("../../entities/vehicle-profit.entity");
let VehicleService = VehicleService_1 = class VehicleService {
    constructor(vehicleRepository, vehicleProfitRepository, uploadService, notificationService) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleProfitRepository = vehicleProfitRepository;
        this.uploadService = uploadService;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(VehicleService_1.name);
    }
    async create(dto, imageFiles, userId) {
        try {
            const existingVehicle = await this.vehicleRepository.findOne({
                where: { vin: dto.vin },
            });
            if (existingVehicle) {
                throw new common_1.ConflictException('Vehicle with this VIN already exists');
            }
            const vehicle = this.vehicleRepository.create({
                ...dto,
                createdBy: userId,
            });
            const savedVehicle = await this.vehicleRepository.save(vehicle);
            if (imageFiles && imageFiles.length > 0) {
                await Promise.all(imageFiles.map((file) => this.uploadService.uploadSingleImage(file, entity_enum_1.ImageEnum.VEHICLE, savedVehicle.id, userId)));
            }
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.VEHICLE_CREATED,
                title: 'New Vehicle Added',
                message: `Vehicle ${dto.make} ${dto.model} (${dto.year}) has been added to the system.`,
                audience: notification_enum_1.NotificationAudienceEnum.ADMIN,
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
                metadata: {
                    vehicleId: savedVehicle.id,
                    make: dto.make,
                    model: dto.model,
                    year: dto.year,
                    vin: dto.vin,
                },
            });
            const vehicleWithRelations = await this.vehicleRepository.findOne({
                where: { id: savedVehicle.id },
                relations: ['images'],
            });
            return vehicle_dto_1.VehicleResponseDto.fromEntity(vehicleWithRelations);
        }
        catch (error) {
            this.logger.error('Failed to create vehicle', error);
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create vehicle');
        }
    }
    async findAll(page = 1, limit = 10, search, make, model, year, minYear, maxYear, isPartedOut) {
        try {
            const skip = (page - 1) * limit;
            const options = {
                relations: ['images'],
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
            };
            options.where = {};
            if (search) {
                options.where = [
                    { make: (0, typeorm_2.ILike)(`%${search}%`) },
                    { model: (0, typeorm_2.ILike)(`%${search}%`) },
                    { vin: (0, typeorm_2.ILike)(`%${search}%`) },
                    { description: (0, typeorm_2.ILike)(`%${search}%`) },
                ];
            }
            if (make) {
                options.where = { ...options.where, make: (0, typeorm_2.ILike)(`%${make}%`) };
            }
            if (model) {
                options.where = {
                    ...options.where,
                    model: (0, typeorm_2.ILike)(`%${model}%`),
                };
            }
            if (year) {
                options.where = { ...options.where, year };
            }
            if (minYear !== undefined && maxYear !== undefined) {
                options.where = {
                    ...options.where,
                    year: (0, typeorm_2.Between)(minYear, maxYear),
                };
            }
            else if (minYear !== undefined) {
                options.where = {
                    ...options.where,
                    year: (0, typeorm_2.MoreThanOrEqual)(minYear),
                };
            }
            else if (maxYear !== undefined) {
                options.where = {
                    ...options.where,
                    year: (0, typeorm_2.LessThanOrEqual)(maxYear),
                };
            }
            if (isPartedOut !== undefined) {
                options.where = { ...options.where, isPartedOut };
            }
            const [rows, total] = await this.vehicleRepository.findAndCount(options);
            const totalPages = Math.ceil(total / limit);
            const hasNext = page < totalPages;
            const hasPrev = page > 1;
            return {
                data: rows.map(vehicle_dto_1.VehicleResponseDto.fromEntity),
                total,
                page,
                limit,
                totalPages,
                hasNext,
                hasPrev,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch vehicles', error);
            throw new common_1.InternalServerErrorException('Failed to fetch vehicles');
        }
    }
    async findOne(id) {
        try {
            const vehicle = await this.vehicleRepository.findOne({
                where: { id },
                relations: ['images', 'parts', 'profitRecords'],
            });
            if (!vehicle) {
                throw new common_1.NotFoundException('Vehicle not found');
            }
            return vehicle_dto_1.VehicleResponseDto.fromEntity(vehicle);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to fetch vehicle');
        }
    }
    async update(id, dto, imageFiles, userId) {
        try {
            const vehicle = await this.vehicleRepository.findOne({
                where: { id },
                relations: ['images'],
            });
            if (!vehicle) {
                throw new common_1.NotFoundException('Vehicle not found');
            }
            if (dto.vin && dto.vin !== vehicle.vin) {
                const existingVehicle = await this.vehicleRepository.findOne({
                    where: { vin: dto.vin },
                });
                if (existingVehicle && existingVehicle.id !== id) {
                    throw new common_1.ConflictException('Vehicle with this VIN already exists');
                }
            }
            const cleanedDto = Object.fromEntries(Object.entries(dto).filter(([_, v]) => v !== '' && v !== null && v !== undefined));
            Object.assign(vehicle, cleanedDto);
            vehicle.updatedBy = userId;
            const savedVehicle = await this.vehicleRepository.save(vehicle);
            if (imageFiles && imageFiles.length > 0) {
                await Promise.all(imageFiles.map((file) => this.uploadService.uploadSingleImage(file, entity_enum_1.ImageEnum.VEHICLE, savedVehicle.id, userId)));
            }
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.VEHICLE_UPDATED,
                title: 'Vehicle Updated',
                message: `Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) has been updated.`,
                audience: notification_enum_1.NotificationAudienceEnum.ADMIN,
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
                metadata: {
                    vehicleId: savedVehicle.id,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    vin: vehicle.vin,
                },
            });
            const updatedVehicle = await this.vehicleRepository.findOne({
                where: { id: savedVehicle.id },
                relations: ['images'],
            });
            return vehicle_dto_1.VehicleResponseDto.fromEntity(updatedVehicle);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update vehicle');
        }
    }
    async remove(id, userId) {
        try {
            const vehicle = await this.vehicleRepository.findOne({
                where: { id },
                relations: ['images', 'parts'],
            });
            if (!vehicle) {
                throw new common_1.NotFoundException('Vehicle not found');
            }
            if (vehicle.parts && vehicle.parts.length > 0) {
                throw new common_1.BadRequestException('Cannot delete vehicle with associated parts');
            }
            if (vehicle.images && vehicle.images.length > 0) {
                await Promise.all(vehicle.images.map((image) => this.uploadService.deleteImage(image.id)));
            }
            await this.vehicleRepository.remove(vehicle);
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.VEHICLE_DELETED,
                title: 'Vehicle Deleted',
                message: `Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) has been deleted.`,
                audience: notification_enum_1.NotificationAudienceEnum.ADMIN,
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
                metadata: {
                    vehicleId: id,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    vin: vehicle.vin,
                },
            });
            return { success: true };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete vehicle');
        }
    }
    async markAsPartedOut(id, userId) {
        try {
            const vehicle = await this.vehicleRepository.findOne({
                where: { id },
                relations: ['images'],
            });
            if (!vehicle) {
                throw new common_1.NotFoundException('Vehicle not found');
            }
            vehicle.isPartedOut = true;
            vehicle.updatedBy = userId;
            const savedVehicle = await this.vehicleRepository.save(vehicle);
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.VEHICLE_PARTED_OUT,
                title: 'Vehicle Parted Out',
                message: `Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) has been marked as parted out.`,
                audience: notification_enum_1.NotificationAudienceEnum.ADMIN,
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
                metadata: {
                    vehicleId: savedVehicle.id,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    vin: vehicle.vin,
                },
            });
            return vehicle_dto_1.VehicleResponseDto.fromEntity(savedVehicle);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to mark vehicle as parted out');
        }
    }
    async getStatistics() {
        try {
            const totalVehicles = await this.vehicleRepository.count();
            const activeVehicles = await this.vehicleRepository.count({
                where: { isActive: true },
            });
            const partedOutVehicles = await this.vehicleRepository.count({
                where: { isPartedOut: true },
            });
            const currentYear = new Date().getFullYear();
            const vehiclesThisYear = await this.vehicleRepository.count({
                where: {
                    purchaseDate: (0, typeorm_2.Between)(new Date(`${currentYear}-01-01`), new Date(`${currentYear}-12-31`)),
                },
            });
            const profitStats = await this.vehicleProfitRepository
                .createQueryBuilder('vp')
                .select('SUM(vp.totalPartsRevenue)', 'totalRevenue')
                .addSelect('SUM(vp.totalPartsCost)', 'totalCost')
                .addSelect('SUM(vp.profit)', 'totalProfit')
                .addSelect('AVG(vp.profitMargin)', 'avgProfitMargin')
                .getRawOne();
            const profitableVehicles = await this.vehicleProfitRepository.count({
                where: { profit: (0, typeorm_2.MoreThanOrEqual)(0) }
            });
            return {
                totalVehicles,
                activeVehicles,
                partedOutVehicles,
                vehiclesThisYear,
                totalRevenue: parseFloat(profitStats.totalRevenue || 0),
                totalCost: parseFloat(profitStats.totalCost || 0),
                totalProfit: parseFloat(profitStats.totalProfit || 0),
                avgProfitMargin: parseFloat(profitStats.avgProfitMargin || 0),
                profitableVehicles,
                profitabilityRate: totalVehicles > 0 ? (profitableVehicles / totalVehicles) * 100 : 0
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch vehicle statistics', error);
            throw new common_1.InternalServerErrorException('Failed to fetch vehicle statistics');
        }
    }
    async getVehicleProfitStats(vehicleId) {
        try {
            const profitRecord = await this.vehicleProfitRepository.findOne({
                where: { vehicle: { id: vehicleId } },
                relations: ['vehicle']
            });
            if (!profitRecord) {
                return this.vehicleProfitRepository.create({
                    totalPartsRevenue: 0,
                    totalPartsCost: 0,
                    profit: 0,
                    profitMargin: 0,
                    isThresholdMet: false,
                    vehicle: { id: vehicleId }
                });
            }
            return profitRecord;
        }
        catch (error) {
            this.logger.error('Failed to fetch vehicle profit stats', error);
            throw new common_1.InternalServerErrorException('Failed to fetch vehicle profit statistics');
        }
    }
    async getAllVehicleProfits() {
        try {
            return await this.vehicleProfitRepository.find({
                relations: ['vehicle'],
                order: { profit: 'DESC' }
            });
        }
        catch (error) {
            this.logger.error('Failed to fetch vehicle profits', error);
            throw new common_1.InternalServerErrorException('Failed to fetch vehicle profits');
        }
    }
    async getTopPerformingVehicles(limit = 10) {
        try {
            return await this.vehicleProfitRepository.find({
                where: { profitMargin: (0, typeorm_2.MoreThanOrEqual)(0) },
                relations: ['vehicle'],
                order: { profitMargin: 'DESC' },
                take: limit
            });
        }
        catch (error) {
            this.logger.error('Failed to fetch top performing vehicles', error);
            throw new common_1.InternalServerErrorException('Failed to fetch top performing vehicles');
        }
    }
    async getMakeModelStatistics() {
        try {
            const makeStats = await this.vehicleRepository
                .createQueryBuilder('vehicle')
                .select('vehicle.make', 'make')
                .addSelect('COUNT(vehicle.id)', 'count')
                .groupBy('vehicle.make')
                .orderBy('count', 'DESC')
                .getRawMany();
            const modelStats = await this.vehicleRepository
                .createQueryBuilder('vehicle')
                .select('vehicle.model', 'model')
                .addSelect('COUNT(vehicle.id)', 'count')
                .groupBy('vehicle.model')
                .orderBy('count', 'DESC')
                .getRawMany();
            return {
                byMake: makeStats,
                byModel: modelStats,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch make/model statistics', error);
            throw new common_1.InternalServerErrorException('Failed to fetch make/model statistics');
        }
    }
};
exports.VehicleService = VehicleService;
exports.VehicleService = VehicleService = VehicleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __param(1, (0, typeorm_1.InjectRepository)(image_entity_1.Image)),
    __param(1, (0, typeorm_1.InjectRepository)(vehicle_profit_entity_1.VehicleProfit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        upload_service_1.UploadService,
        notification_service_1.NotificationService])
], VehicleService);
//# sourceMappingURL=vehicle.service.js.map