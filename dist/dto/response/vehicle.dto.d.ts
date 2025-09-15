import { Vehicle } from '../../entities/vehicle.entity';
import { VehicleProfit } from 'src/entities/vehicle-profit.entity';
export declare class VehicleResponseDto {
    id: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    description: string;
    purchasePrice: number;
    purchaseDate: Date;
    auctionName?: string;
    isPartedOut: boolean;
    isActive: boolean;
    images?: Array<{
        id: string;
        url: string;
        publicId?: string;
        format?: string;
    }>;
    profitRecord?: {
        totalPartsRevenue: number;
        totalPartsCost: number;
        profit: number;
        profitMargin: number;
        isThresholdMet: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(entity: Vehicle): VehicleResponseDto;
}
export declare class VehicleProfitResponseDto {
    id: string;
    totalPartsRevenue: number;
    totalPartsCost: number;
    profit: number;
    profitMargin: number;
    isThresholdMet: boolean;
    vehicleId: string;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(entity: VehicleProfit): VehicleProfitResponseDto;
}
export declare class VehicleProfitStatsResponseDto {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    avgProfitMargin: number;
    profitableVehicles: number;
    profitabilityRate: number;
    totalVehicles: number;
    activeVehicles: number;
    partedOutVehicles: number;
    vehiclesThisYear: number;
}
