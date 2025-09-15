import { CategoryService } from './category.service';
import { CategoryResponseDto, PaginatedCategoryResponse, PaginatedCategoryTreeResponse } from '../../dto/response/category.dto';
import { CategoryQueryDto, CategoryTreeQueryDto, CreateCategoryDto, UpdateCategoryDto } from 'src/dto/request/category.dto';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    create(dto: CreateCategoryDto, image?: Express.Multer.File, req?: any): Promise<CategoryResponseDto>;
    findTree(queryDto: CategoryTreeQueryDto): Promise<PaginatedCategoryTreeResponse>;
    findChildren(id: string): Promise<CategoryResponseDto[]>;
    findAll(queryDto: CategoryQueryDto): Promise<PaginatedCategoryResponse>;
    findOne(id: string): Promise<CategoryResponseDto>;
    update(id: string, dto: UpdateCategoryDto, image?: Express.Multer.File, req?: any): Promise<CategoryResponseDto>;
    remove(id: string): Promise<{
        success: true;
    }>;
}
