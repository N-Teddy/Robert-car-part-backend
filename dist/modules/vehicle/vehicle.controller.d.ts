import { VehicleResponseDto } from '../../dto/response/vehicle.dto';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto, UpdateVehicleDto } from 'src/dto/request/vehicle.dto';
export declare class VehicleController {
    private readonly vehicleService;
    constructor(vehicleService: VehicleService);
    create(dto: CreateVehicleDto, images: Express.Multer.File[], req: any): Promise<VehicleResponseDto>;
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
    update(id: string, dto: UpdateVehicleDto, images: Express.Multer.File[], req: any): Promise<VehicleResponseDto>;
    remove(id: string, req: any): Promise<{
        success: true;
    }>;
    markAsPartedOut(id: string, req: any): Promise<VehicleResponseDto>;
    getStatistics(): Promise<any>;
    getMakeModelStatistics(): Promise<any>;
}
