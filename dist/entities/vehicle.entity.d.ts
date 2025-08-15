import { Part } from './part.entity';
import { VehicleProfit } from './vehicle-profit.entity';
import { Image } from './image.entity';
import { BaseEntity } from './base.entity';
export declare class Vehicle extends BaseEntity {
    make: string;
    model: string;
    year: number;
    vin: string;
    description: string;
    purchasePrice: number;
    purchaseDate: Date;
    auctionName?: string;
    isPartedOut: boolean;
    parts: Part[];
    profitRecords: VehicleProfit[];
    images: Image[];
}
