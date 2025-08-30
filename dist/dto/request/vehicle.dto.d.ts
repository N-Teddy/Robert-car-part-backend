export declare class CreateVehicleDto {
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
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    description?: string;
    purchasePrice?: number;
    purchaseDate?: string;
    auctionName?: string;
    isPartedOut?: boolean;
}
export declare class BulkCreateVehicleDto {
    vehicles: CreateVehicleDto[];
}
export declare class BulkUpdateVehicleItemDto {
    id: string;
    data: UpdateVehicleDto;
}
export declare class BulkUpdateVehicleDto {
    vehicles: BulkUpdateVehicleItemDto[];
}
export declare class VehicleSearchDto {
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    isPartedOut?: boolean;
    minPrice?: number;
    maxPrice?: number;
    purchaseDateFrom?: string;
    purchaseDateTo?: string;
}
export declare class VehiclePaginationDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export declare class VehicleExportDto {
    format?: 'csv' | 'pdf';
    search?: VehicleSearchDto;
}
