import { CategoryResponseDto } from '../response/category.dto';
export declare class CreateCategoryDto {
    name: string;
    description?: string;
    parentId?: string;
    order?: number;
    isActive?: boolean;
    imageId?: string;
}
declare const UpdateCategoryDto_base: import("@nestjs/common").Type<Partial<CreateCategoryDto>>;
export declare class UpdateCategoryDto extends UpdateCategoryDto_base {
}
export declare class CategoryQueryDto {
    name?: string;
    parentId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    isActive?: boolean;
}
export declare class CategoryTreeDto extends CategoryResponseDto {
    children: CategoryTreeDto[];
    depth: number;
    constructor(category: any, depth?: number);
}
export {};
