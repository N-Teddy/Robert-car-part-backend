import { Repository } from 'typeorm';
import { Vehicle } from '../../entities/vehicle.entity';
import { Image } from '../../entities/image.entity';
import { VehicleResponseDto } from '../../dto/response/vehicle.dto';
import { UploadService } from '../upload/upload.service';
import { NotificationService } from '../notification/notification.service';
import { CreateVehicleDto, UpdateVehicleDto } from 'src/dto/request/vehicle.dto';
export declare class VehicleService {
    private readonly vehicleRepository;
    private readonly imageRepository;
    private readonly uploadService;
    private readonly notificationService;
    private readonly logger;
    constructor(vehicleRepository: Repository<Vehicle>, imageRepository: Repository<Image>, uploadService: UploadService, notificationService: NotificationService);
    create(dto: CreateVehicleDto, imageFiles: Express.Multer.File[], userId: string): Promise<VehicleResponseDto>;
    findAll(page?: number, limit?: number, search?: string, make?: string, model?: string, year?: number, minYear?: number, maxYear?: number, isPartedOut?: boolean): Promise<{
        data: VehicleResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    findOne(id: string): Promise<VehicleResponseDto>;
    update(id: string, dto: UpdateVehicleDto, imageFiles: Express.Multer.File[], userId: string): Promise<VehicleResponseDto>;
    remove(id: string, userId: string): Promise<{
        success: true;
    }>;
    markAsPartedOut(id: string, userId: string): Promise<VehicleResponseDto>;
    getStatistics(): Promise<any>;
    getMakeModelStatistics(): Promise<any>;
}
