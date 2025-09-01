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
const part_entity_1 = require("../../entities/part.entity");
const vehicle_profit_entity_1 = require("../../entities/vehicle-profit.entity");
const image_entity_1 = require("../../entities/image.entity");
const user_entity_1 = require("../../entities/user.entity");
const upload_service_1 = require("../upload/upload.service");
const notification_service_1 = require("../notification/notification.service");
const entity_enum_1 = require("../../common/enum/entity.enum");
let VehicleService = VehicleService_1 = class VehicleService {
    constructor(vehicleRepository, partRepository, vehicleProfitRepository, imageRepository, userRepository, uploadService, notificationService) {
        this.vehicleRepository = vehicleRepository;
        this.partRepository = partRepository;
        this.vehicleProfitRepository = vehicleProfitRepository;
        this.imageRepository = imageRepository;
        this.userRepository = userRepository;
        this.uploadService = uploadService;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(VehicleService_1.name);
    }
    async createVehicle(createVehicleDto, userId) {
        try {
            const existingVehicle = await this.vehicleRepository.findOne({
                where: { vin: createVehicleDto.vin },
            });
            if (existingVehicle) {
                throw new common_1.ConflictException(`Vehicle with VIN ${createVehicleDto.vin} already exists`);
            }
            const vehicle = this.vehicleRepository.create({
                ...createVehicleDto,
                purchaseDate: new Date(createVehicleDto.purchaseDate),
                createdBy: userId,
                updatedBy: userId,
            });
            const savedVehicle = await this.vehicleRepository.save(vehicle);
            try {
                const createdByUser = await this.userRepository.findOne({
                    where: { id: userId },
                });
            }
            catch (notificationError) {
                this.logger.warn(`Failed to send vehicle creation notification: ${notificationError.message}`);
            }
            this.logger.log(`Vehicle created successfully: ${savedVehicle.id}`);
            return savedVehicle;
        }
        catch (error) {
            this.logger.error(`Failed to create vehicle: ${error.message}`);
            throw error;
        }
    }
    async createVehiclesBulk(bulkCreateDto, userId) {
        const results = [];
        const vehiclesToCreate = [];
        const vins = bulkCreateDto.vehicles.map((v) => v.vin);
        const existingVehicles = await this.vehicleRepository.find({
            where: { vin: (0, typeorm_2.In)(vins) },
        });
        const existingVins = existingVehicles.map((v) => v.vin);
        for (let i = 0; i < bulkCreateDto.vehicles.length; i++) {
            const vehicleDto = bulkCreateDto.vehicles[i];
            try {
                if (existingVins.includes(vehicleDto.vin)) {
                    results.push({
                        index: i,
                        error: `Vehicle with VIN ${vehicleDto.vin} already exists`,
                    });
                }
                else {
                    vehiclesToCreate.push({
                        ...vehicleDto,
                        purchaseDate: new Date(vehicleDto.purchaseDate),
                        createdBy: userId,
                        updatedBy: userId,
                    });
                    results.push({ index: i });
                }
            }
            catch (error) {
                results.push({
                    index: i,
                    error: error.message,
                });
            }
        }
        if (vehiclesToCreate.length > 0) {
            const createdVehicles = await this.vehicleRepository.save(vehiclesToCreate);
            let vehicleIndex = 0;
            for (let i = 0; i < results.length; i++) {
                if (!results[i].error) {
                    results[i].id = createdVehicles[vehicleIndex].id;
                    results[i].data = createdVehicles[vehicleIndex];
                    vehicleIndex++;
                }
            }
        }
        return results;
    }
    async findAll(searchDto = {}, paginationDto = {}) {
        try {
            const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', } = paginationDto;
            const skip = (page - 1) * limit;
            const queryBuilder = this.buildSearchQuery(searchDto);
            queryBuilder.orderBy(`vehicle.${sortBy}`, sortOrder);
            queryBuilder.skip(skip).take(limit);
            const [vehicles, total] = await queryBuilder.getManyAndCount();
            const vehiclesWithStats = await Promise.all(vehicles.map((vehicle) => this.calculateVehicleStats(vehicle)));
            const totalPages = Math.ceil(total / limit);
            const meta = {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            };
            return { vehicles: vehiclesWithStats, meta };
        }
        catch (error) {
            this.logger.error(`Failed to find vehicles: ${error.message}`);
            throw error;
        }
    }
    async findOne(id) {
        try {
            const vehicle = await this.vehicleRepository.findOne({
                where: { id },
                relations: ['parts', 'profitRecords', 'images'],
            });
            if (!vehicle) {
                throw new common_1.NotFoundException(`Vehicle with ID ${id} not found`);
            }
            return await this.calculateVehicleStats(vehicle);
        }
        catch (error) {
            this.logger.error(`Failed to find vehicle: ${error.message}`);
            throw error;
        }
    }
    async findByVin(vin) {
        try {
            const vehicle = await this.vehicleRepository.findOne({
                where: { vin },
                relations: ['parts', 'profitRecords', 'images'],
            });
            if (!vehicle) {
                throw new common_1.NotFoundException(`Vehicle with VIN ${vin} not found`);
            }
            return await this.calculateVehicleStats(vehicle);
        }
        catch (error) {
            this.logger.error(`Failed to find vehicle by VIN: ${error.message}`);
            throw error;
        }
    }
    async updateVehicle(id, updateVehicleDto, userId) {
        try {
            const vehicle = await this.vehicleRepository.findOne({
                where: { id },
            });
            if (!vehicle) {
                throw new common_1.NotFoundException(`Vehicle with ID ${id} not found`);
            }
            if (updateVehicleDto.vin && updateVehicleDto.vin !== vehicle.vin) {
                const existingVehicle = await this.vehicleRepository.findOne({
                    where: { vin: updateVehicleDto.vin },
                });
                if (existingVehicle) {
                    throw new common_1.ConflictException(`Vehicle with VIN ${updateVehicleDto.vin} already exists`);
                }
            }
            const changes = [];
            const originalVehicle = { ...vehicle };
            Object.assign(vehicle, {
                ...updateVehicleDto,
                ...(updateVehicleDto.purchaseDate && {
                    purchaseDate: new Date(updateVehicleDto.purchaseDate),
                }),
                updatedBy: userId,
            });
            const updatedVehicle = await this.vehicleRepository.save(vehicle);
            if (updateVehicleDto.make &&
                updateVehicleDto.make !== originalVehicle.make) {
                changes.push(`Make: ${originalVehicle.make} → ${updateVehicleDto.make}`);
            }
            if (updateVehicleDto.model &&
                updateVehicleDto.model !== originalVehicle.model) {
                changes.push(`Model: ${originalVehicle.model} → ${updateVehicleDto.model}`);
            }
            if (updateVehicleDto.year &&
                updateVehicleDto.year !== originalVehicle.year) {
                changes.push(`Year: ${originalVehicle.year} → ${updateVehicleDto.year}`);
            }
            if (updateVehicleDto.description &&
                updateVehicleDto.description !== originalVehicle.description) {
                changes.push('Description updated');
            }
            if (updateVehicleDto.purchasePrice &&
                updateVehicleDto.purchasePrice !== originalVehicle.purchasePrice) {
                changes.push(`Purchase Price: $${originalVehicle.purchasePrice} → $${updateVehicleDto.purchasePrice}`);
            }
            if (updateVehicleDto.auctionName !== undefined &&
                updateVehicleDto.auctionName !== originalVehicle.auctionName) {
                changes.push(`Auction Name: ${originalVehicle.auctionName || 'None'} → ${updateVehicleDto.auctionName || 'None'}`);
            }
            if (changes.length > 0) {
                try {
                    const updatedByUser = await this.userRepository.findOne({
                        where: { id: userId },
                    });
                    if (updatedByUser) {
                    }
                }
                catch (notificationError) {
                    this.logger.warn(`Failed to send vehicle update notification: ${notificationError.message}`);
                }
            }
            this.logger.log(`Vehicle updated successfully: ${id}`);
            return updatedVehicle;
        }
        catch (error) {
            this.logger.error(`Failed to update vehicle: ${error.message}`);
            throw error;
        }
    }
    async updateVehiclesBulk(bulkUpdateDto, userId) {
        const results = [];
        for (let i = 0; i < bulkUpdateDto.vehicles.length; i++) {
            const { id, data } = bulkUpdateDto.vehicles[i];
            try {
                const result = await this.updateVehicle(id, data, userId);
                results.push({
                    index: i,
                    id,
                    data: result,
                });
            }
            catch (error) {
                results.push({
                    index: i,
                    id,
                    error: error.message,
                });
            }
        }
        return results;
    }
    async deleteVehicle(id, userId) {
        try {
            const vehicle = await this.vehicleRepository.findOne({
                where: { id },
                relations: ['parts', 'images'],
            });
            if (!vehicle) {
                throw new common_1.NotFoundException(`Vehicle with ID ${id} not found`);
            }
            if (vehicle.parts && vehicle.parts.length > 0) {
                throw new common_1.BadRequestException('Cannot delete vehicle with existing parts');
            }
            try {
                const deletedByUser = await this.userRepository.findOne({
                    where: { id: userId },
                });
                if (deletedByUser) {
                }
            }
            catch (notificationError) {
                this.logger.warn(`Failed to send vehicle deletion notification: ${notificationError.message}`);
            }
            if (vehicle.images && vehicle.images.length > 0) {
                for (const image of vehicle.images) {
                    await this.uploadService.deleteImage(image.id);
                }
            }
            await this.vehicleRepository.remove(vehicle);
            this.logger.log(`Vehicle deleted successfully: ${id}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete vehicle: ${error.message}`);
            throw error;
        }
    }
    async markAsPartedOut(id, userId) {
        try {
            const vehicle = await this.vehicleRepository.findOne({
                where: { id },
            });
            if (!vehicle) {
                throw new common_1.NotFoundException(`Vehicle with ID ${id} not found`);
            }
            if (vehicle.isPartedOut) {
                throw new common_1.BadRequestException('Vehicle is already marked as parted out');
            }
            vehicle.isPartedOut = true;
            vehicle.updatedBy = userId;
            const updatedVehicle = await this.vehicleRepository.save(vehicle);
            try {
                const updatedByUser = await this.userRepository.findOne({
                    where: { id: userId },
                });
                if (updatedByUser) {
                }
            }
            catch (notificationError) {
                this.logger.warn(`Failed to send vehicle parted out notification: ${notificationError.message}`);
            }
            this.logger.log(`Vehicle marked as parted out: ${id}`);
            return updatedVehicle;
        }
        catch (error) {
            this.logger.error(`Failed to mark vehicle as parted out: ${error.message}`);
            throw error;
        }
    }
    async getVehicleStats() {
        try {
            const [totalVehicles, partedOutVehicles] = await Promise.all([
                this.vehicleRepository.count(),
                this.vehicleRepository.count({ where: { isPartedOut: true } }),
            ]);
            const intactVehicles = totalVehicles - partedOutVehicles;
            const financialStats = await this.vehicleRepository
                .createQueryBuilder('vehicle')
                .select(['SUM(vehicle.purchasePrice) as totalPurchaseCost'])
                .getRawOne();
            const partsStats = await this.partRepository
                .createQueryBuilder('part')
                .leftJoin('part.vehicle', 'vehicle')
                .select([
                'SUM(part.sellingPrice) as totalPartsRevenue',
                'SUM(part.costPrice) as totalPartsCost',
            ])
                .getRawOne();
            const totalPurchaseCost = parseFloat(financialStats.totalPurchaseCost) || 0;
            const totalPartsRevenue = parseFloat(partsStats.totalPartsRevenue) || 0;
            const totalPartsCost = parseFloat(partsStats.totalPartsCost) || 0;
            const totalProfit = totalPartsRevenue - totalPartsCost;
            const averageProfitPerVehicle = totalVehicles > 0 ? totalProfit / totalVehicles : 0;
            const overallProfitMargin = totalPartsRevenue > 0
                ? (totalProfit / totalPartsRevenue) * 100
                : 0;
            const makeBreakdown = await this.vehicleRepository
                .createQueryBuilder('vehicle')
                .select('vehicle.make', 'make')
                .addSelect('COUNT(*)', 'count')
                .groupBy('vehicle.make')
                .getRawMany();
            const yearBreakdown = await this.vehicleRepository
                .createQueryBuilder('vehicle')
                .select("CASE WHEN vehicle.year BETWEEN 2015 AND 2019 THEN '2015-2019' ELSE '2020-2024' END", 'yearRange')
                .addSelect('COUNT(*)', 'count')
                .groupBy('yearRange')
                .getRawMany();
            return {
                totalVehicles,
                partedOutVehicles,
                intactVehicles,
                totalPurchaseCost,
                totalPartsRevenue,
                totalProfit,
                averageProfitPerVehicle,
                overallProfitMargin,
                makeBreakdown: makeBreakdown.reduce((acc, item) => {
                    acc[item.make] = parseInt(item.count);
                    return acc;
                }, {}),
                yearBreakdown: yearBreakdown.reduce((acc, item) => {
                    acc[item.yearRange] = parseInt(item.count);
                    return acc;
                }, {}),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get vehicle stats: ${error.message}`);
            throw error;
        }
    }
    async exportVehicles(exportDto) {
        try {
            const { format = 'csv', search } = exportDto;
            const queryBuilder = this.buildSearchQuery(search || {});
            const vehicles = await queryBuilder.getMany();
            if (format === 'csv') {
                return this.generateCsvExport(vehicles);
            }
            else if (format === 'pdf') {
                return this.generatePdfExport(vehicles);
            }
            else {
                throw new common_1.BadRequestException('Unsupported export format');
            }
        }
        catch (error) {
            this.logger.error(`Failed to export vehicles: ${error.message}`);
            throw error;
        }
    }
    async uploadVehicleImages(vehicleId, files, folder) {
        try {
            const vehicle = await this.vehicleRepository.findOne({
                where: { id: vehicleId },
            });
            if (!vehicle) {
                throw new common_1.NotFoundException(`Vehicle with ID ${vehicleId} not found`);
            }
            const uploadedImages = [];
            for (const file of files) {
                const result = await this.uploadService.uploadImage(file, entity_enum_1.ImageEnum.VEHICLE, vehicleId, 'vehicle', folder);
                const image = await this.imageRepository.findOne({
                    where: { id: result.imageId },
                });
                if (image) {
                    uploadedImages.push(image);
                }
            }
            this.logger.log(`Uploaded ${uploadedImages.length} images for vehicle: ${vehicleId}`);
            return uploadedImages;
        }
        catch (error) {
            this.logger.error(`Failed to upload vehicle images: ${error.message}`);
            throw error;
        }
    }
    async calculateVehicleStats(vehicle) {
        try {
            const partsStats = await this.partRepository
                .createQueryBuilder('part')
                .where('part.vehicle.id = :vehicleId', {
                vehicleId: vehicle.id,
            })
                .select([
                'COUNT(*) as totalParts',
                'SUM(part.sellingPrice) as totalPartsRevenue',
                'SUM(part.costPrice) as totalPartsCost',
            ])
                .getRawOne();
            const totalParts = parseInt(partsStats.totalParts) || 0;
            const totalPartsRevenue = parseFloat(partsStats.totalPartsRevenue) || 0;
            const totalPartsCost = parseFloat(partsStats.totalPartsCost) || 0;
            const totalProfit = totalPartsRevenue - totalPartsCost;
            const profitMargin = totalPartsRevenue > 0
                ? (totalProfit / totalPartsRevenue) * 100
                : 0;
            return {
                ...vehicle,
                totalParts,
                totalPartsRevenue,
                totalPartsCost,
                totalProfit,
                profitMargin,
            };
        }
        catch (error) {
            this.logger.error(`Failed to calculate vehicle stats: ${error.message}`);
            return {
                ...vehicle,
                totalParts: 0,
                totalPartsRevenue: 0,
                totalPartsCost: 0,
                totalProfit: 0,
                profitMargin: 0,
            };
        }
    }
    buildSearchQuery(searchDto) {
        const queryBuilder = this.vehicleRepository
            .createQueryBuilder('vehicle')
            .leftJoinAndSelect('vehicle.images', 'images')
            .leftJoinAndSelect('vehicle.parts', 'parts');
        if (searchDto.make) {
            queryBuilder.andWhere('vehicle.make ILIKE :make', {
                make: `%${searchDto.make}%`,
            });
        }
        if (searchDto.model) {
            queryBuilder.andWhere('vehicle.model ILIKE :model', {
                model: `%${searchDto.model}%`,
            });
        }
        if (searchDto.year) {
            queryBuilder.andWhere('vehicle.year = :year', {
                year: searchDto.year,
            });
        }
        if (searchDto.vin) {
            queryBuilder.andWhere('vehicle.vin ILIKE :vin', {
                vin: `%${searchDto.vin}%`,
            });
        }
        if (searchDto.isPartedOut !== undefined) {
            queryBuilder.andWhere('vehicle.isPartedOut = :isPartedOut', {
                isPartedOut: searchDto.isPartedOut,
            });
        }
        if (searchDto.minPrice !== undefined) {
            queryBuilder.andWhere('vehicle.purchasePrice >= :minPrice', {
                minPrice: searchDto.minPrice,
            });
        }
        if (searchDto.maxPrice !== undefined) {
            queryBuilder.andWhere('vehicle.purchasePrice <= :maxPrice', {
                maxPrice: searchDto.maxPrice,
            });
        }
        if (searchDto.purchaseDateFrom) {
            queryBuilder.andWhere('vehicle.purchaseDate >= :purchaseDateFrom', {
                purchaseDateFrom: new Date(searchDto.purchaseDateFrom),
            });
        }
        if (searchDto.purchaseDateTo) {
            queryBuilder.andWhere('vehicle.purchaseDate <= :purchaseDateTo', {
                purchaseDateTo: new Date(searchDto.purchaseDateTo),
            });
        }
        return queryBuilder;
    }
    generateCsvExport(vehicles) {
        const headers = [
            'ID',
            'Make',
            'Model',
            'Year',
            'VIN',
            'Description',
            'Purchase Price',
            'Purchase Date',
            'Auction Name',
            'Is Parted Out',
            'Created At',
        ];
        const rows = vehicles.map((vehicle) => [
            vehicle.id || '',
            vehicle.make || '',
            vehicle.model || '',
            vehicle.year || '',
            vehicle.vin || '',
            vehicle.description || '',
            vehicle.purchasePrice || 0,
            vehicle.purchaseDate
                ? vehicle.purchaseDate instanceof Date
                    ? vehicle.purchaseDate.toISOString().split('T')[0]
                    : new Date(vehicle.purchaseDate).toISOString().split('T')[0]
                : '',
            vehicle.auctionName || '',
            vehicle.isPartedOut ? 'Yes' : 'No',
            vehicle.createdAt
                ? vehicle.createdAt instanceof Date
                    ? vehicle.createdAt.toISOString().split('T')[0]
                    : new Date(vehicle.createdAt).toISOString().split('T')[0]
                : '',
        ]);
        const csvContent = [headers, ...rows]
            .map((row) => row.map((field) => `"${field}"`).join(','))
            .join('\n');
        return csvContent;
    }
    generatePdfExport(vehicles) {
        try {
            return `PDF export for ${vehicles?.length || 0} vehicles - Implementation needed`;
        }
        catch (error) {
            this.logger.error(`Failed to generate PDF export: ${error.message}`);
            return 'PDF export failed - Implementation needed';
        }
    }
};
exports.VehicleService = VehicleService;
exports.VehicleService = VehicleService = VehicleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __param(1, (0, typeorm_1.InjectRepository)(part_entity_1.Part)),
    __param(2, (0, typeorm_1.InjectRepository)(vehicle_profit_entity_1.VehicleProfit)),
    __param(3, (0, typeorm_1.InjectRepository)(image_entity_1.Image)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        upload_service_1.UploadService,
        notification_service_1.NotificationService])
], VehicleService);
//# sourceMappingURL=vehicle.service.js.map