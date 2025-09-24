import { Category } from '../../entities/category.entity';
export declare class CategoryResponseDto {
    id: string;
    name: string;
    description?: string;
    image?: {
        id: string;
        url: string;
        publicId?: string;
        format?: string;
    };
    parentId?: string;
    children?: CategoryResponseDto[];
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(entity: Category): CategoryResponseDto;
    static fromEntityWithChildren(entity: Category): CategoryResponseDto;
}
export declare class PaginatedCategoryTreeResponse {
    data: CategoryResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class PaginatedCategoryResponse {
    data: CategoryResponseDto[];
    total: number;
    page: number;
    limit: number;
}
