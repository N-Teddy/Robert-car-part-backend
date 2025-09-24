export declare class CreateVehicleDto {
    images?: any[];
    make: string;
    model: string;
    year: number;
    vin: string;
    description: string;
    purchasePrice: number;
    purchaseDate: string;
    auctionName?: string;
    isPartedOut?: boolean;
}
export declare class UpdateVehicleDto {
    images?: any[];
    make?: string;
    model?: string;
    year?: Date;
    vin?: string;
    description?: string;
    purchasePrice?: number;
    purchaseDate?: string;
    auctionName?: string;
    isPartedOut?: boolean;
    isActive?: boolean;
}
export declare class VehicleQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    make?: string;
    model?: string;
    year?: number;
    minYear?: number;
    maxYear?: number;
    isPartedOut?: boolean;
}
