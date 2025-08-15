import { Vehicle } from './vehicle.entity';
import { BaseEntity } from './base.entity';
export declare class VehicleProfit extends BaseEntity {
    totalPartsRevenue: number;
    totalPartsCost: number;
    profit: number;
    profitMargin: number;
    isThresholdMet: boolean;
    vehicle: Vehicle;
}
