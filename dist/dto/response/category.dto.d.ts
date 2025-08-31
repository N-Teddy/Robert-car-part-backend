import { ImageDto, ImagesResponseDto } from './upload.dto';
export declare class CategoryResponseDto {
    id: string;
    name: string;
    description?: string;
    slug: string;
    order: number;
    isActive: boolean;
    parentId?: string;
    image?: ImagesResponseDto;
    partCount: number;
    createdAt: Date;
    updatedAt: Date;
    images: ImageDto[];
    constructor(category: any);
}
