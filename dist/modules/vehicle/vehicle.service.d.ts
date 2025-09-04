import { Repository } from 'typeorm';
import { Vehicle } from '../../entities/vehicle.entity';
import { Part } from '../../entities/part.entity';
import { VehicleProfit } from '../../entities/vehicle-profit.entity';
import { Image } from '../../entities/image.entity';
import { User } from '../../entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { CreateVehicleDto, UpdateVehicleDto, BulkCreateVehicleDto, BulkUpdateVehicleDto, VehicleSearchDto, VehiclePaginationDto, VehicleExportDto } from '../../dto/request/vehicle.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface VehicleWithStats extends Vehicle {
    totalParts: number;
    totalPartsRevenue: number;
    totalPartsCost: number;
    totalProfit: number;
    profitMargin: number;
}
export declare class VehicleService {
    private vehicleRepository;
    private partRepository;
    private vehicleProfitRepository;
    private imageRepository;
    private userRepository;
    private notificationService;
    private eventEmitter;
    private readonly logger;
    constructor(vehicleRepository: Repository<Vehicle>, partRepository: Repository<Part>, vehicleProfitRepository: Repository<VehicleProfit>, imageRepository: Repository<Image>, userRepository: Repository<User>, notificationService: NotificationService, eventEmitter: EventEmitter2);
    createVehicle(createVehicleDto: CreateVehicleDto, userId: string): Promise<Vehicle>;
    createVehiclesBulk(bulkCreateDto: BulkCreateVehicleDto, userId: string): Promise<any[]>;
    findAll(searchDto?: VehicleSearchDto, paginationDto?: VehiclePaginationDto): Promise<{
        vehicles: VehicleWithStats[];
        meta: any;
    }>;
    findOne(id: string): Promise<VehicleWithStats>;
    findByVin(vin: string): Promise<VehicleWithStats>;
    updateVehicle(id: string, updateVehicleDto: UpdateVehicleDto, userId: string): Promise<Vehicle>;
    updateVehiclesBulk(bulkUpdateDto: BulkUpdateVehicleDto, userId: string): Promise<any[]>;
    deleteVehicle(id: string, userId: string): Promise<void>;
    markAsPartedOut(id: string, userId: string): Promise<Vehicle>;
    getVehicleStats(): Promise<any>;
    exportVehicles(exportDto: VehicleExportDto): Promise<string>;
    uploadVehicleImages(vehicleId: string, files: Express.Multer.File[], folder?: string): Promise<Image[]>;
    private calculateVehicleStats;
    private buildSearchQuery;
    private generateCsvExport;
    private generatePdfExport;
}
