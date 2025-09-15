import { Repository } from 'typeorm';
import { Part } from '../../entities/part.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Category } from '../../entities/category.entity';
import { QrCode } from '../../entities/qr-code.entity';
import { Image } from '../../entities/image.entity';
import { PartResponseDto } from '../../dto/response/part.dto';
import { UploadService } from '../upload/upload.service';
import { NotificationService } from '../notification/notification.service';
import { CreatePartDto, PartsQueryDto, UpdatePartDto } from 'src/dto/request/part.dto';
export declare class PartService {
    private readonly partRepository;
    private readonly vehicleRepository;
    private readonly categoryRepository;
    private readonly qrCodeRepository;
    private readonly imageRepository;
    private readonly uploadService;
    private readonly notificationService;
    private readonly logger;
    constructor(partRepository: Repository<Part>, vehicleRepository: Repository<Vehicle>, categoryRepository: Repository<Category>, qrCodeRepository: Repository<QrCode>, imageRepository: Repository<Image>, uploadService: UploadService, notificationService: NotificationService);
    create(dto: CreatePartDto, imageFiles: Express.Multer.File[], userId: string): Promise<PartResponseDto>;
    private generateQrCodeForPart;
    findAll(queryParams: PartsQueryDto): Promise<{
        data: PartResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    findOne(id: string): Promise<PartResponseDto>;
    update(id: string, dto: UpdatePartDto, imageFiles: Express.Multer.File[], userId: string): Promise<PartResponseDto>;
    remove(id: string, userId: string): Promise<{
        success: true;
    }>;
    getStatistics(): Promise<any>;
    getCategoryStatistics(): Promise<any>;
    getLowStockParts(): Promise<PartResponseDto[]>;
}
