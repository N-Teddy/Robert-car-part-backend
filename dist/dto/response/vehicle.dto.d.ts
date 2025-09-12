import { Vehicle } from '../../entities/vehicle.entity';
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
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(entity: Vehicle): VehicleResponseDto;
}
