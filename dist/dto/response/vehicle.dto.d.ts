import { ImageDto } from './upload.dto';
export declare class VehicleDto {
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
    totalParts: number;
    totalPartsRevenue: number;
    totalPartsCost: number;
    totalProfit: number;
    profitMargin: number;
    images: ImageDto[];
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class VehicleSummaryDto {
    id: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    purchasePrice: number;
    purchaseDate: Date;
    isPartedOut: boolean;
    totalProfit: number;
    mainImage?: ImageDto;
    createdAt: Date;
}
export declare class VehicleResponseDto {
    message: string;
    data: VehicleDto;
}
export declare class PaginationMetaDto {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export declare class VehiclesResponseDto {
    message: string;
    data: VehicleSummaryDto[];
    meta: PaginationMetaDto;
}
export declare class VehicleStatsDto {
    totalVehicles: number;
    partedOutVehicles: number;
    intactVehicles: number;
    totalPurchaseCost: number;
    totalPartsRevenue: number;
    totalProfit: number;
    averageProfitPerVehicle: number;
    overallProfitMargin: number;
    makeBreakdown: Record<string, number>;
    yearBreakdown: Record<string, number>;
}
export declare class VehicleStatsResponseDto {
    message: string;
    data: VehicleStatsDto;
}
export declare class BulkOperationResultDto {
    id?: string;
    data?: VehicleDto;
    error?: string;
    index: number;
}
export declare class BulkCreateResponseDto {
    message: string;
    data: BulkOperationResultDto[];
    summary: {
        total: number;
        successful: number;
        failed: number;
    };
}
export declare class BulkUpdateResponseDto {
    message: string;
    data: BulkOperationResultDto[];
    summary: {
        total: number;
        successful: number;
        failed: number;
    };
}
export declare class VehicleExportResponseDto {
    message: string;
    data: string;
    format: string;
    count: number;
}
