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
