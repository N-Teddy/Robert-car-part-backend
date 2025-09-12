import { PartService } from './part.service';
import { PartResponseDto } from '../../dto/response/part.dto';
import { CreatePartDto, UpdatePartDto } from 'src/dto/request/part.dto';
export declare class PartController {
    private readonly partService;
    constructor(partService: PartService);
    create(dto: CreatePartDto, images: Express.Multer.File[], req: any): Promise<PartResponseDto>;
    findAll(page?: number, limit?: number, search?: string, vehicleId?: string, categoryId?: string, minPrice?: number, maxPrice?: number, minQuantity?: number, maxQuantity?: number, condition?: string): Promise<{
        data: PartResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    findOne(id: string): Promise<PartResponseDto>;
    update(id: string, dto: UpdatePartDto, images: Express.Multer.File[], req: any): Promise<PartResponseDto>;
    remove(id: string, req: any): Promise<{
        success: true;
    }>;
    getStatistics(): Promise<any>;
    getCategoryStatistics(): Promise<any>;
    getLowStockParts(): Promise<PartResponseDto[]>;
}
