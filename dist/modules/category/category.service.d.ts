import { Repository, TreeRepository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { Image } from '../../entities/image.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../../dto/request/category.dto';
import { CategoryResponseDto, PaginatedCategoryTreeResponse } from '../../dto/response/category.dto';
import { UploadService } from '../upload/upload.service';
import { NotificationService } from '../notification/notification.service';
export declare class CategoryService {
    private readonly categoryRepo;
    private readonly imageRepo;
    private readonly uploadService;
    private readonly notificationService;
    constructor(categoryRepo: TreeRepository<Category>, imageRepo: Repository<Image>, uploadService: UploadService, notificationService: NotificationService);
    create(dto: CreateCategoryDto, imageFile?: Express.Multer.File, userId?: string): Promise<CategoryResponseDto>;
    findTree(page?: number, limit?: number, search?: string): Promise<PaginatedCategoryTreeResponse>;
    findChildren(parentId: string): Promise<CategoryResponseDto[]>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        data: CategoryResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<CategoryResponseDto>;
    update(id: string, dto: UpdateCategoryDto, imageFile?: Express.Multer.File, userId?: string): Promise<CategoryResponseDto>;
    remove(id: string): Promise<{
        success: true;
    }>;
    private checkCircularReference;
    private mapToTreeResponseDto;
}
