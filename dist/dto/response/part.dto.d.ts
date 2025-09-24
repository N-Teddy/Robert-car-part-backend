import { Part } from '../../entities/part.entity';
export declare class PartResponseDto {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    condition?: string;
    partNumber?: string;
    vehicleId: string;
    categoryId: string;
    qrCodeUrl?: string;
    images?: Array<{
        id: string;
        url: string;
        publicId?: string;
        format?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(entity: Part): PartResponseDto;
}
