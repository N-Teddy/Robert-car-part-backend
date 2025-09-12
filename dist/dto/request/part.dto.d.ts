export declare class CreatePartDto {
    images?: any[];
    name: string;
    description: string;
    price: number;
    quantity: number;
    condition?: string;
    partNumber?: string;
    vehicleId: string;
    categoryId: string;
}
export declare class UpdatePartDto {
    images?: any[];
    name?: string;
    description?: string;
    price?: number;
    quantity?: number;
    condition?: string;
    partNumber?: string;
    vehicleId?: string;
    categoryId?: string;
}
