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
exports.VehicleExportDto = exports.VehiclePaginationDto = exports.VehicleSearchDto = exports.BulkUpdateVehicleDto = exports.BulkUpdateVehicleItemDto = exports.BulkCreateVehicleDto = exports.UpdateVehicleDto = exports.CreateVehicleDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateVehicleDto {
}
exports.CreateVehicleDto = CreateVehicleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle make (brand)',
        example: 'Toyota',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "make", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle model',
        example: 'Camry',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle year',
        example: 2020,
        minimum: 1900,
        maximum: 2030,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1900),
    (0, class_validator_1.Max)(2030),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle Identification Number (unique)',
        example: '1HGBH41JXMN109186',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "vin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle description',
        example: 'Well-maintained sedan with low mileage',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Purchase price of the vehicle',
        example: 15000.00,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date when vehicle was purchased',
        example: '2024-01-15',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the auction where vehicle was purchased (optional)',
        example: 'Copart Auto Auction',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "auctionName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the vehicle has been parted out',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVehicleDto.prototype, "isPartedOut", void 0);
class UpdateVehicleDto {
}
exports.UpdateVehicleDto = UpdateVehicleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle make (brand)',
        example: 'Toyota',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "make", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle model',
        example: 'Camry',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle year',
        example: 2020,
        minimum: 1900,
        maximum: 2030,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1900),
    (0, class_validator_1.Max)(2030),
    __metadata("design:type", Number)
], UpdateVehicleDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle Identification Number (unique)',
        example: '1HGBH41JXMN109186',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "vin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle description',
        example: 'Well-maintained sedan with low mileage',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Purchase price of the vehicle',
        example: 15000.00,
        minimum: 0,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateVehicleDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date when vehicle was purchased',
        example: '2024-01-15',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the auction where vehicle was purchased (optional)',
        example: 'Copart Auto Auction',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "auctionName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the vehicle has been parted out',
        example: false,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateVehicleDto.prototype, "isPartedOut", void 0);
class BulkCreateVehicleDto {
}
exports.BulkCreateVehicleDto = BulkCreateVehicleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of vehicles to create',
        type: [CreateVehicleDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateVehicleDto),
    __metadata("design:type", Array)
], BulkCreateVehicleDto.prototype, "vehicles", void 0);
class BulkUpdateVehicleItemDto {
}
exports.BulkUpdateVehicleItemDto = BulkUpdateVehicleItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle ID to update',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], BulkUpdateVehicleItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle data to update',
        type: UpdateVehicleDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UpdateVehicleDto),
    __metadata("design:type", UpdateVehicleDto)
], BulkUpdateVehicleItemDto.prototype, "data", void 0);
class BulkUpdateVehicleDto {
}
exports.BulkUpdateVehicleDto = BulkUpdateVehicleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of vehicle updates with IDs',
        type: [BulkUpdateVehicleItemDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkUpdateVehicleItemDto),
    __metadata("design:type", Array)
], BulkUpdateVehicleDto.prototype, "vehicles", void 0);
class VehicleSearchDto {
}
exports.VehicleSearchDto = VehicleSearchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search by vehicle make',
        example: 'Toyota',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleSearchDto.prototype, "make", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search by vehicle model',
        example: 'Camry',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleSearchDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search by vehicle year',
        example: 2020,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VehicleSearchDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search by VIN (partial match)',
        example: '1HGBH',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleSearchDto.prototype, "vin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by parted out status',
        example: false,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VehicleSearchDto.prototype, "isPartedOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum purchase price',
        example: 10000,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VehicleSearchDto.prototype, "minPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum purchase price',
        example: 25000,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VehicleSearchDto.prototype, "maxPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Purchase date from (YYYY-MM-DD)',
        example: '2024-01-01',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], VehicleSearchDto.prototype, "purchaseDateFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Purchase date to (YYYY-MM-DD)',
        example: '2024-12-31',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], VehicleSearchDto.prototype, "purchaseDateTo", void 0);
class VehiclePaginationDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = 'createdAt';
        this.sortOrder = 'DESC';
    }
}
exports.VehiclePaginationDto = VehiclePaginationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number (1-based)',
        example: 1,
        default: 1,
        minimum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], VehiclePaginationDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 10,
        default: 10,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], VehiclePaginationDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort field',
        example: 'createdAt',
        enum: ['make', 'model', 'year', 'purchasePrice', 'purchaseDate', 'createdAt', 'updatedAt'],
        default: 'createdAt',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehiclePaginationDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort order',
        example: 'DESC',
        enum: ['ASC', 'DESC'],
        default: 'DESC',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['ASC', 'DESC']),
    __metadata("design:type", String)
], VehiclePaginationDto.prototype, "sortOrder", void 0);
class VehicleExportDto {
    constructor() {
        this.format = 'csv';
    }
}
exports.VehicleExportDto = VehicleExportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Export format',
        example: 'csv',
        enum: ['csv', 'pdf'],
        default: 'csv',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['csv', 'pdf']),
    __metadata("design:type", String)
], VehicleExportDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search criteria for export',
        type: VehicleSearchDto,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VehicleSearchDto),
    __metadata("design:type", VehicleSearchDto)
], VehicleExportDto.prototype, "search", void 0);
//# sourceMappingURL=vehicle.dto.js.map