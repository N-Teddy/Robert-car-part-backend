import { CategoryService } from './category.service';
import { CategoryResponseDto, PaginatedCategoryTreeResponse } from '../../dto/response/category.dto';
import { CreateCategoryDto, UpdateCategoryDto } from 'src/dto/request/category.dto';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    create(dto: CreateCategoryDto, image?: Express.Multer.File, req?: any): Promise<CategoryResponseDto>;
    findTree(page?: number, limit?: number, search?: string): Promise<PaginatedCategoryTreeResponse>;
    findChildren(id: string): Promise<CategoryResponseDto[]>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        data: CategoryResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<CategoryResponseDto>;
    update(id: string, dto: UpdateCategoryDto, image?: Express.Multer.File, req?: any): Promise<CategoryResponseDto>;
    remove(id: string): Promise<{
        success: true;
    }>;
}
