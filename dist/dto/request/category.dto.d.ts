export declare class CreateCategoryDto {
    image?: any;
    name: string;
    description?: string;
    parentId?: string;
}
export declare class UpdateCategoryDto {
    image?: any;
    name?: string;
    description?: string;
    parentId?: string | null;
}
export declare class CategoryQueryDto {
    page?: number;
    limit?: number;
    search?: string;
}
