import { Repository } from 'typeorm';
import { Vehicle } from '../../entities/vehicle.entity';
import { VehicleResponseDto } from '../../dto/response/vehicle.dto';
import { UploadService } from '../upload/upload.service';
import { NotificationService } from '../notification/notification.service';
import { CreateVehicleDto, UpdateVehicleDto } from 'src/dto/request/vehicle.dto';
import { VehicleProfit } from 'src/entities/vehicle-profit.entity';
export declare class VehicleService {
    private readonly vehicleRepository;
    private readonly vehicleProfitRepository;
    private readonly uploadService;
    private readonly notificationService;
    private readonly logger;
    constructor(vehicleRepository: Repository<Vehicle>, vehicleProfitRepository: Repository<VehicleProfit>, uploadService: UploadService, notificationService: NotificationService);
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
    getVehicleProfitStats(vehicleId: string): Promise<VehicleProfit>;
    getAllVehicleProfits(): Promise<VehicleProfit[]>;
    getTopPerformingVehicles(limit?: number): Promise<VehicleProfit[]>;
    getMakeModelStatistics(): Promise<any>;
}
