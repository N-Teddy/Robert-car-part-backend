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
exports.VehicleProfitStatsResponseDto = exports.VehicleProfitResponseDto = exports.VehicleResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const vehicle_profit_entity_1 = require("../../entities/vehicle-profit.entity");
class VehicleResponseDto {
    static fromEntity(entity) {
        const dto = new VehicleResponseDto();
        dto.id = entity.id;
        dto.make = entity.make;
        dto.model = entity.model;
        dto.year = entity.year;
        dto.vin = entity.vin;
        dto.description = entity.description;
        dto.purchasePrice = entity.purchasePrice;
        dto.purchaseDate = entity.purchaseDate;
        dto.auctionName = entity.auctionName;
        dto.isPartedOut = entity.isPartedOut;
        dto.isActive = entity.isActive;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;
        if (entity.images && entity.images.length > 0) {
            dto.images = entity.images.map((img) => ({
                id: img.id,
                url: img.url,
                publicId: img.publicId,
                format: img.format,
            }));
        }
        if (entity.profitRecords && entity.profitRecords.length > 0) {
            const profitRecord = entity.profitRecords[0];
            dto.profitRecord = {
                totalPartsRevenue: profitRecord.totalPartsRevenue,
                totalPartsCost: profitRecord.totalPartsCost,
                profit: profitRecord.profit,
                profitMargin: profitRecord.profitMargin,
                isThresholdMet: profitRecord.isThresholdMet,
                createdAt: profitRecord.createdAt,
                updatedAt: profitRecord.updatedAt,
            };
        }
        return dto;
    }
}
exports.VehicleResponseDto = VehicleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], VehicleResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], VehicleResponseDto.prototype, "make", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], VehicleResponseDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], VehicleResponseDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], VehicleResponseDto.prototype, "vin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], VehicleResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], VehicleResponseDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], VehicleResponseDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], VehicleResponseDto.prototype, "auctionName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], VehicleResponseDto.prototype, "isPartedOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], VehicleResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    __metadata("design:type", Array)
], VehicleResponseDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: vehicle_profit_entity_1.VehicleProfit }),
    __metadata("design:type", Object)
], VehicleResponseDto.prototype, "profitRecord", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], VehicleResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], VehicleResponseDto.prototype, "updatedAt", void 0);
class VehicleProfitResponseDto {
    static fromEntity(entity) {
        const dto = new VehicleProfitResponseDto();
        dto.id = entity.id;
        dto.totalPartsRevenue = entity.totalPartsRevenue;
        dto.totalPartsCost = entity.totalPartsCost;
        dto.profit = entity.profit;
        dto.profitMargin = entity.profitMargin;
        dto.isThresholdMet = entity.isThresholdMet;
        dto.vehicleId = entity.vehicle?.id;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;
        return dto;
    }
}
exports.VehicleProfitResponseDto = VehicleProfitResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], VehicleProfitResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total revenue from parts sales for this vehicle' }),
    __metadata("design:type", Number)
], VehicleProfitResponseDto.prototype, "totalPartsRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total cost of parts sold for this vehicle' }),
    __metadata("design:type", Number)
], VehicleProfitResponseDto.prototype, "totalPartsCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profit (revenue - cost)' }),
    __metadata("design:type", Number)
], VehicleProfitResponseDto.prototype, "profit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profit margin percentage (profit / revenue * 100)' }),
    __metadata("design:type", Number)
], VehicleProfitResponseDto.prototype, "profitMargin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the profit margin meets the threshold' }),
    __metadata("design:type", Boolean)
], VehicleProfitResponseDto.prototype, "isThresholdMet", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vehicle ID associated with this profit record' }),
    __metadata("design:type", String)
], VehicleProfitResponseDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], VehicleProfitResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], VehicleProfitResponseDto.prototype, "updatedAt", void 0);
class VehicleProfitStatsResponseDto {
}
exports.VehicleProfitStatsResponseDto = VehicleProfitStatsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total revenue from all vehicle parts sales' }),
    __metadata("design:type", Number)
], VehicleProfitStatsResponseDto.prototype, "totalRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total cost of all parts sold' }),
    __metadata("design:type", Number)
], VehicleProfitStatsResponseDto.prototype, "totalCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total profit across all vehicles' }),
    __metadata("design:type", Number)
], VehicleProfitStatsResponseDto.prototype, "totalProfit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average profit margin percentage across all vehicles' }),
    __metadata("design:type", Number)
], VehicleProfitStatsResponseDto.prototype, "avgProfitMargin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of vehicles that have generated profit' }),
    __metadata("design:type", Number)
], VehicleProfitStatsResponseDto.prototype, "profitableVehicles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Percentage of vehicles that are profitable' }),
    __metadata("design:type", Number)
], VehicleProfitStatsResponseDto.prototype, "profitabilityRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of vehicles' }),
    __metadata("design:type", Number)
], VehicleProfitStatsResponseDto.prototype, "totalVehicles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of active vehicles' }),
    __metadata("design:type", Number)
], VehicleProfitStatsResponseDto.prototype, "activeVehicles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of vehicles that have been parted out' }),
    __metadata("design:type", Number)
], VehicleProfitStatsResponseDto.prototype, "partedOutVehicles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of vehicles purchased this year' }),
    __metadata("design:type", Number)
], VehicleProfitStatsResponseDto.prototype, "vehiclesThisYear", void 0);
//# sourceMappingURL=vehicle.dto.js.map