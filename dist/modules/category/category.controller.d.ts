import { CategoryService } from './category.service';
import { CategoryResponseDto } from 'src/dto/response/category.dto';
import { CategoryQueryDto, CategoryTreeDto, CreateCategoryDto, UpdateCategoryDto } from 'src/dto/request/category.dto';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto>;
    findAll(query: CategoryQueryDto): Promise<{
        data: CategoryResponseDto[];
        total: number;
    }>;
    getTree(): Promise<CategoryTreeDto[]>;
    findOne(id: string): Promise<CategoryResponseDto>;
    getDescendants(id: string): Promise<CategoryTreeDto[]>;
    getAncestors(id: string): Promise<CategoryResponseDto[]>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto>;
    remove(id: string): Promise<void>;
}
