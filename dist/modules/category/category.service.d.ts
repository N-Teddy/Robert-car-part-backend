import { Repository, DataSource } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CategoryResponseDto } from 'src/dto/response/category.dto';
import { CategoryTreeDto, CreateCategoryDto, UpdateCategoryDto } from 'src/dto/request/category.dto';
import { CategoryQueryDto } from '../../dto/request/category.dto';
export declare class CategoryService {
    private categoryRepository;
    private dataSource;
    private treeRepository;
    constructor(categoryRepository: Repository<Category>, dataSource: DataSource);
    create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto>;
    findAll(query: CategoryQueryDto): Promise<{
        data: CategoryResponseDto[];
        total: number;
    }>;
    findOne(id: string): Promise<CategoryResponseDto>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto>;
    remove(id: string): Promise<void>;
    getTree(): Promise<CategoryTreeDto[]>;
    getDescendants(id: string): Promise<CategoryTreeDto[]>;
    getAncestors(id: string): Promise<CategoryResponseDto[]>;
    private getPartCount;
    private addPartCountsToTree;
    private generateSlug;
    private isCircularReference;
}
