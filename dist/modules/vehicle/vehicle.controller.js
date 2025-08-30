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
exports.VehicleController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const vehicle_service_1 = require("./vehicle.service");
const upload_service_1 = require("../upload/upload.service");
const entity_enum_1 = require("../../common/enum/entity.enum");
const entity_enum_2 = require("../../common/enum/entity.enum");
const vehicle_dto_1 = require("../../dto/request/vehicle.dto");
const vehicle_dto_2 = require("../../dto/response/vehicle.dto");
const validateImageMimeType = (file) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }
    return true;
};
let VehicleController = class VehicleController {
    constructor(vehicleService, uploadService) {
        this.vehicleService = vehicleService;
        this.uploadService = uploadService;
    }
    async createVehicle(createVehicleDto, req) {
        const vehicle = await this.vehicleService.createVehicle(createVehicleDto, req.user.id);
        const vehicleWithStats = await this.vehicleService.findOne(vehicle.id);
        return {
            message: 'Vehicle created successfully',
            data: vehicleWithStats,
        };
    }
    async createVehiclesBulk(bulkCreateDto, req) {
        const results = await this.vehicleService.createVehiclesBulk(bulkCreateDto, req.user.id);
        const successful = results.filter(r => !r.error).length;
        const failed = results.filter(r => r.error).length;
        return {
            message: 'Bulk vehicle creation completed',
            data: results,
            summary: {
                total: results.length,
                successful,
                failed,
            },
        };
    }
    async updateVehiclesBulk(bulkUpdateDto, req) {
        const results = await this.vehicleService.updateVehiclesBulk(bulkUpdateDto, req.user.id);
        const successful = results.filter(r => !r.error).length;
        const failed = results.filter(r => r.error).length;
        return {
            message: 'Bulk vehicle update completed',
            data: results,
            summary: {
                total: results.length,
                successful,
                failed,
            },
        };
    }
    async findAll(searchDto, paginationDto) {
        const { vehicles, meta } = await this.vehicleService.findAll(searchDto, paginationDto);
        return {
            message: 'Vehicles retrieved successfully',
            data: vehicles,
            meta,
        };
    }
    async getVehicleStats() {
        const stats = await this.vehicleService.getVehicleStats();
        return {
            message: 'Vehicle statistics retrieved successfully',
            data: stats,
        };
    }
    async exportVehicles(exportDto) {
        const exportData = await this.vehicleService.exportVehicles(exportDto);
        return {
            message: 'Vehicle export completed successfully',
            data: exportData,
            format: exportDto.format || 'csv',
            count: 0,
        };
    }
    async findOne(id) {
        const vehicle = await this.vehicleService.findOne(id);
        return {
            message: 'Vehicle retrieved successfully',
            data: vehicle,
        };
    }
    async findByVin(vin) {
        const vehicle = await this.vehicleService.findByVin(vin);
        return {
            message: 'Vehicle retrieved successfully',
            data: vehicle,
        };
    }
    async updateVehicle(id, updateVehicleDto, req) {
        const vehicle = await this.vehicleService.updateVehicle(id, updateVehicleDto, req.user.id);
        const vehicleWithStats = await this.vehicleService.findOne(id);
        return {
            message: 'Vehicle updated successfully',
            data: vehicleWithStats,
        };
    }
    async markAsPartedOut(id, req) {
        const vehicle = await this.vehicleService.markAsPartedOut(id, req.user.id);
        const vehicleWithStats = await this.vehicleService.findOne(id);
        return {
            message: 'Vehicle marked as parted out successfully',
            data: vehicleWithStats,
        };
    }
    async uploadVehicleImages(id, files, folder) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files uploaded');
        }
        for (const file of files) {
            validateImageMimeType(file);
        }
        const uploadedImages = [];
        for (const file of files) {
            try {
                const result = await this.uploadService.uploadImage(file, entity_enum_1.ImageEnum.VEHICLE, id, 'vehicle', folder);
                uploadedImages.push({
                    id: result.imageId,
                    url: result.url,
                    filename: file.originalname,
                });
            }
            catch (error) {
                uploadedImages.push({
                    error: error.message,
                    filename: file.originalname,
                });
            }
        }
        return {
            message: 'Vehicle images uploaded successfully',
            data: uploadedImages,
        };
    }
    async deleteVehicle(id, req) {
        await this.vehicleService.deleteVehicle(id, req.user.id);
        return {
            message: 'Vehicle deleted successfully',
        };
    }
};
exports.VehicleController = VehicleController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new vehicle',
        description: 'Create a new vehicle with the provided details. VIN must be unique.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Vehicle created successfully', type: vehicle_dto_2.VehicleResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'VIN already exists' }),
    (0, roles_decorator_1.Roles)(entity_enum_2.UserRoleEnum.ADMIN, entity_enum_2.UserRoleEnum.MANAGER, entity_enum_2.UserRoleEnum.DEV, entity_enum_2.UserRoleEnum.SALES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vehicle_dto_1.CreateVehicleDto, Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "createVehicle", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create multiple vehicles',
        description: 'Create multiple vehicles in a single request. Duplicate VINs will be skipped.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bulk vehicle creation completed', type: vehicle_dto_2.BulkCreateResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, roles_decorator_1.Roles)(entity_enum_2.UserRoleEnum.ADMIN, entity_enum_2.UserRoleEnum.MANAGER, entity_enum_2.UserRoleEnum.DEV),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vehicle_dto_1.BulkCreateVehicleDto, Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "createVehiclesBulk", null);
__decorate([
    (0, common_1.Put)('bulk'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update multiple vehicles',
        description: 'Update multiple vehicles in a single request.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk vehicle update completed', type: vehicle_dto_2.BulkUpdateResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, roles_decorator_1.Roles)(entity_enum_2.UserRoleEnum.ADMIN, entity_enum_2.UserRoleEnum.MANAGER, entity_enum_2.UserRoleEnum.DEV),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vehicle_dto_1.BulkUpdateVehicleDto, Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "updateVehiclesBulk", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all vehicles',
        description: 'Retrieve vehicles with optional search, filtering, and pagination.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicles retrieved successfully', type: vehicle_dto_2.VehiclesResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiQuery)({ name: 'make', required: false, description: 'Filter by vehicle make' }),
    (0, swagger_1.ApiQuery)({ name: 'model', required: false, description: 'Filter by vehicle model' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false, description: 'Filter by vehicle year' }),
    (0, swagger_1.ApiQuery)({ name: 'vin', required: false, description: 'Filter by VIN (partial match)' }),
    (0, swagger_1.ApiQuery)({ name: 'isPartedOut', required: false, description: 'Filter by parted out status' }),
    (0, swagger_1.ApiQuery)({ name: 'minPrice', required: false, description: 'Minimum purchase price' }),
    (0, swagger_1.ApiQuery)({ name: 'maxPrice', required: false, description: 'Maximum purchase price' }),
    (0, swagger_1.ApiQuery)({ name: 'purchaseDateFrom', required: false, description: 'Purchase date from (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'purchaseDateTo', required: false, description: 'Purchase date to (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page (default: 10, max: 100)' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: 'Sort field (default: createdAt)' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, description: 'Sort order: ASC or DESC (default: DESC)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vehicle_dto_1.VehicleSearchDto,
        vehicle_dto_1.VehiclePaginationDto]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get vehicle statistics',
        description: 'Retrieve comprehensive statistics about all vehicles including financial metrics.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle statistics retrieved successfully', type: vehicle_dto_2.VehicleStatsResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, roles_decorator_1.Roles)(entity_enum_2.UserRoleEnum.ADMIN, entity_enum_2.UserRoleEnum.MANAGER, entity_enum_2.UserRoleEnum.DEV),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "getVehicleStats", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, swagger_1.ApiOperation)({
        summary: 'Export vehicles',
        description: 'Export vehicles to CSV or PDF format with optional filtering.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle export completed successfully', type: vehicle_dto_2.VehicleExportResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, roles_decorator_1.Roles)(entity_enum_2.UserRoleEnum.ADMIN, entity_enum_2.UserRoleEnum.MANAGER, entity_enum_2.UserRoleEnum.DEV),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vehicle_dto_1.VehicleExportDto]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "exportVehicles", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get vehicle by ID',
        description: 'Retrieve a specific vehicle by its ID with all related data.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle retrieved successfully', type: vehicle_dto_2.VehicleResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('vin/:vin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get vehicle by VIN',
        description: 'Retrieve a specific vehicle by its VIN with all related data.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle retrieved successfully', type: vehicle_dto_2.VehicleResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    __param(0, (0, common_1.Param)('vin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "findByVin", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update vehicle',
        description: 'Update an existing vehicle. VIN uniqueness will be validated if changed.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle updated successfully', type: vehicle_dto_2.VehicleResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'VIN already exists' }),
    (0, roles_decorator_1.Roles)(entity_enum_2.UserRoleEnum.ADMIN, entity_enum_2.UserRoleEnum.MANAGER, entity_enum_2.UserRoleEnum.DEV, entity_enum_2.UserRoleEnum.SALES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vehicle_dto_1.UpdateVehicleDto, Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "updateVehicle", null);
__decorate([
    (0, common_1.Put)(':id/parted-out'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark vehicle as parted out',
        description: 'Mark a vehicle as parted out when parts start being sold.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle marked as parted out successfully', type: vehicle_dto_2.VehicleResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    (0, roles_decorator_1.Roles)(entity_enum_2.UserRoleEnum.ADMIN, entity_enum_2.UserRoleEnum.MANAGER, entity_enum_2.UserRoleEnum.DEV, entity_enum_2.UserRoleEnum.SALES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "markAsPartedOut", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload vehicle images',
        description: 'Upload multiple images for a specific vehicle.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Vehicle images uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    (0, roles_decorator_1.Roles)(entity_enum_2.UserRoleEnum.ADMIN, entity_enum_2.UserRoleEnum.MANAGER, entity_enum_2.UserRoleEnum.DEV, entity_enum_2.UserRoleEnum.SALES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
    }))),
    __param(2, (0, common_1.Query)('folder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, String]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "uploadVehicleImages", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete vehicle',
        description: 'Permanently delete a vehicle. Cannot delete if it has existing parts.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Vehicle has parts' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    (0, roles_decorator_1.Roles)(entity_enum_2.UserRoleEnum.ADMIN, entity_enum_2.UserRoleEnum.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "deleteVehicle", null);
exports.VehicleController = VehicleController = __decorate([
    (0, swagger_1.ApiTags)('Vehicles'),
    (0, common_1.Controller)('vehicles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [vehicle_service_1.VehicleService,
        upload_service_1.UploadService])
], VehicleController);
//# sourceMappingURL=vehicle.controller.js.map