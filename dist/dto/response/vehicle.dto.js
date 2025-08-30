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
exports.VehicleExportResponseDto = exports.BulkUpdateResponseDto = exports.BulkCreateResponseDto = exports.BulkOperationResultDto = exports.VehicleStatsResponseDto = exports.VehicleStatsDto = exports.VehiclesResponseDto = exports.PaginationMetaDto = exports.VehicleResponseDto = exports.VehicleSummaryDto = exports.VehicleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const upload_dto_1 = require("./upload.dto");
class VehicleDto {
}
exports.VehicleDto = VehicleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier of the vehicle',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], VehicleDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle make (brand)',
        example: 'Toyota',
    }),
    __metadata("design:type", String)
], VehicleDto.prototype, "make", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle model',
        example: 'Camry',
    }),
    __metadata("design:type", String)
], VehicleDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle year',
        example: 2020,
    }),
    __metadata("design:type", Number)
], VehicleDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle Identification Number (unique)',
        example: '1HGBH41JXMN109186',
    }),
    __metadata("design:type", String)
], VehicleDto.prototype, "vin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle description',
        example: 'Well-maintained sedan with low mileage',
    }),
    __metadata("design:type", String)
], VehicleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Purchase price of the vehicle',
        example: 15000.00,
    }),
    __metadata("design:type", Number)
], VehicleDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date when vehicle was purchased',
        example: '2024-01-15T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], VehicleDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the auction where vehicle was purchased (optional)',
        example: 'Copart Auto Auction',
        required: false,
    }),
    __metadata("design:type", String)
], VehicleDto.prototype, "auctionName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the vehicle has been parted out',
        example: false,
    }),
    __metadata("design:type", Boolean)
], VehicleDto.prototype, "isPartedOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of parts from this vehicle',
        example: 25,
    }),
    __metadata("design:type", Number)
], VehicleDto.prototype, "totalParts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total revenue from parts sold',
        example: 8500.00,
    }),
    __metadata("design:type", Number)
], VehicleDto.prototype, "totalPartsRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total cost of parts',
        example: 3000.00,
    }),
    __metadata("design:type", Number)
], VehicleDto.prototype, "totalPartsCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total profit from parts',
        example: 5500.00,
    }),
    __metadata("design:type", Number)
], VehicleDto.prototype, "totalProfit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Profit margin percentage',
        example: 64.71,
    }),
    __metadata("design:type", Number)
], VehicleDto.prototype, "profitMargin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle images',
        type: [upload_dto_1.ImageDto],
    }),
    __metadata("design:type", Array)
], VehicleDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User who created the vehicle',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    }),
    __metadata("design:type", String)
], VehicleDto.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User who last updated the vehicle',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    }),
    __metadata("design:type", String)
], VehicleDto.prototype, "updatedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-01-15T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], VehicleDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-20T14:45:00.000Z',
    }),
    __metadata("design:type", Date)
], VehicleDto.prototype, "updatedAt", void 0);
class VehicleSummaryDto {
}
exports.VehicleSummaryDto = VehicleSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier of the vehicle',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], VehicleSummaryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle make (brand)',
        example: 'Toyota',
    }),
    __metadata("design:type", String)
], VehicleSummaryDto.prototype, "make", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle model',
        example: 'Camry',
    }),
    __metadata("design:type", String)
], VehicleSummaryDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle year',
        example: 2020,
    }),
    __metadata("design:type", Number)
], VehicleSummaryDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle Identification Number (unique)',
        example: '1HGBH41JXMN109186',
    }),
    __metadata("design:type", String)
], VehicleSummaryDto.prototype, "vin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Purchase price of the vehicle',
        example: 15000.00,
    }),
    __metadata("design:type", Number)
], VehicleSummaryDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date when vehicle was purchased',
        example: '2024-01-15T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], VehicleSummaryDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the vehicle has been parted out',
        example: false,
    }),
    __metadata("design:type", Boolean)
], VehicleSummaryDto.prototype, "isPartedOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total profit from parts',
        example: 5500.00,
    }),
    __metadata("design:type", Number)
], VehicleSummaryDto.prototype, "totalProfit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Main vehicle image',
        type: upload_dto_1.ImageDto,
        required: false,
    }),
    __metadata("design:type", upload_dto_1.ImageDto)
], VehicleSummaryDto.prototype, "mainImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-01-15T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], VehicleSummaryDto.prototype, "createdAt", void 0);
class VehicleResponseDto {
}
exports.VehicleResponseDto = VehicleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Vehicle retrieved successfully',
    }),
    __metadata("design:type", String)
], VehicleResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle data',
        type: VehicleDto,
    }),
    __metadata("design:type", VehicleDto)
], VehicleResponseDto.prototype, "data", void 0);
class PaginationMetaDto {
}
exports.PaginationMetaDto = PaginationMetaDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current page number',
        example: 1,
    }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 10,
    }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of items',
        example: 150,
    }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of pages',
        example: 15,
    }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether there is a next page',
        example: true,
    }),
    __metadata("design:type", Boolean)
], PaginationMetaDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether there is a previous page',
        example: false,
    }),
    __metadata("design:type", Boolean)
], PaginationMetaDto.prototype, "hasPrevPage", void 0);
class VehiclesResponseDto {
}
exports.VehiclesResponseDto = VehiclesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Vehicles retrieved successfully',
    }),
    __metadata("design:type", String)
], VehiclesResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of vehicles',
        type: [VehicleSummaryDto],
    }),
    __metadata("design:type", Array)
], VehiclesResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pagination information',
        type: PaginationMetaDto,
    }),
    __metadata("design:type", PaginationMetaDto)
], VehiclesResponseDto.prototype, "meta", void 0);
class VehicleStatsDto {
}
exports.VehicleStatsDto = VehicleStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of vehicles',
        example: 150,
    }),
    __metadata("design:type", Number)
], VehicleStatsDto.prototype, "totalVehicles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of vehicles that have been parted out',
        example: 45,
    }),
    __metadata("design:type", Number)
], VehicleStatsDto.prototype, "partedOutVehicles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of vehicles still intact',
        example: 105,
    }),
    __metadata("design:type", Number)
], VehicleStatsDto.prototype, "intactVehicles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total purchase cost of all vehicles',
        example: 2250000.00,
    }),
    __metadata("design:type", Number)
], VehicleStatsDto.prototype, "totalPurchaseCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total revenue from all parts sold',
        example: 1875000.00,
    }),
    __metadata("design:type", Number)
], VehicleStatsDto.prototype, "totalPartsRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total profit from all parts',
        example: 1125000.00,
    }),
    __metadata("design:type", Number)
], VehicleStatsDto.prototype, "totalProfit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Average profit per vehicle',
        example: 7500.00,
    }),
    __metadata("design:type", Number)
], VehicleStatsDto.prototype, "averageProfitPerVehicle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Overall profit margin percentage',
        example: 60.00,
    }),
    __metadata("design:type", Number)
], VehicleStatsDto.prototype, "overallProfitMargin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Breakdown by make',
        example: {
            'Toyota': 25,
            'Honda': 20,
            'Ford': 15,
        },
    }),
    __metadata("design:type", Object)
], VehicleStatsDto.prototype, "makeBreakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Breakdown by year range',
        example: {
            '2015-2019': 45,
            '2020-2024': 105,
        },
    }),
    __metadata("design:type", Object)
], VehicleStatsDto.prototype, "yearBreakdown", void 0);
class VehicleStatsResponseDto {
}
exports.VehicleStatsResponseDto = VehicleStatsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Vehicle statistics retrieved successfully',
    }),
    __metadata("design:type", String)
], VehicleStatsResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle statistics data',
        type: VehicleStatsDto,
    }),
    __metadata("design:type", VehicleStatsDto)
], VehicleStatsResponseDto.prototype, "data", void 0);
class BulkOperationResultDto {
}
exports.BulkOperationResultDto = BulkOperationResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    }),
    __metadata("design:type", String)
], BulkOperationResultDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Operation result data',
        type: VehicleDto,
        required: false,
    }),
    __metadata("design:type", VehicleDto)
], BulkOperationResultDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Error message if operation failed',
        example: 'VIN already exists',
        required: false,
    }),
    __metadata("design:type", String)
], BulkOperationResultDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Index of the item in the bulk operation',
        example: 0,
    }),
    __metadata("design:type", Number)
], BulkOperationResultDto.prototype, "index", void 0);
class BulkCreateResponseDto {
}
exports.BulkCreateResponseDto = BulkCreateResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Bulk vehicle creation completed',
    }),
    __metadata("design:type", String)
], BulkCreateResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of operation results',
        type: [BulkOperationResultDto],
    }),
    __metadata("design:type", Array)
], BulkCreateResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Summary of the operation',
        example: {
            total: 5,
            successful: 4,
            failed: 1,
        },
    }),
    __metadata("design:type", Object)
], BulkCreateResponseDto.prototype, "summary", void 0);
class BulkUpdateResponseDto {
}
exports.BulkUpdateResponseDto = BulkUpdateResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Bulk vehicle update completed',
    }),
    __metadata("design:type", String)
], BulkUpdateResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of operation results',
        type: [BulkOperationResultDto],
    }),
    __metadata("design:type", Array)
], BulkUpdateResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Summary of the operation',
        example: {
            total: 5,
            successful: 4,
            failed: 1,
        },
    }),
    __metadata("design:type", Object)
], BulkUpdateResponseDto.prototype, "summary", void 0);
class VehicleExportResponseDto {
}
exports.VehicleExportResponseDto = VehicleExportResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Vehicle export completed successfully',
    }),
    __metadata("design:type", String)
], VehicleExportResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Export file URL or data',
        example: 'http://localhost:3000/exports/vehicles-2024-01-15.csv',
    }),
    __metadata("design:type", String)
], VehicleExportResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Export format',
        example: 'csv',
    }),
    __metadata("design:type", String)
], VehicleExportResponseDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of vehicles exported',
        example: 150,
    }),
    __metadata("design:type", Number)
], VehicleExportResponseDto.prototype, "count", void 0);
//# sourceMappingURL=vehicle.dto.js.map