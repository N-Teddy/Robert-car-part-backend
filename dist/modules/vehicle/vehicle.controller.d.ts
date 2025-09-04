import { VehicleService } from './vehicle.service';
import { CreateVehicleDto, UpdateVehicleDto, BulkCreateVehicleDto, BulkUpdateVehicleDto, VehicleSearchDto, VehiclePaginationDto, VehicleExportDto } from '../../dto/request/vehicle.dto';
import { VehicleResponseDto, VehiclesResponseDto, VehicleStatsResponseDto, BulkCreateResponseDto, BulkUpdateResponseDto, VehicleExportResponseDto } from '../../dto/response/vehicle.dto';
export declare class VehicleController {
    private readonly vehicleService;
    constructor(vehicleService: VehicleService);
    createVehicle(createVehicleDto: CreateVehicleDto, req: any): Promise<VehicleResponseDto>;
    createVehiclesBulk(bulkCreateDto: BulkCreateVehicleDto, req: any): Promise<BulkCreateResponseDto>;
    updateVehiclesBulk(bulkUpdateDto: BulkUpdateVehicleDto, req: any): Promise<BulkUpdateResponseDto>;
    findAll(searchDto: VehicleSearchDto, paginationDto: VehiclePaginationDto): Promise<VehiclesResponseDto>;
    getVehicleStats(): Promise<VehicleStatsResponseDto>;
    exportVehicles(exportDto: VehicleExportDto): Promise<VehicleExportResponseDto>;
    findOne(id: string): Promise<VehicleResponseDto>;
    findByVin(vin: string): Promise<VehicleResponseDto>;
    updateVehicle(id: string, updateVehicleDto: UpdateVehicleDto, req: any): Promise<VehicleResponseDto>;
    markAsPartedOut(id: string, req: any): Promise<VehicleResponseDto>;
    deleteVehicle(id: string, req: any): Promise<{
        message: string;
    }>;
}
