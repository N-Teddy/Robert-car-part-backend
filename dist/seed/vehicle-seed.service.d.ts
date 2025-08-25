import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
export declare class VehicleSeedService {
    private readonly vehicleRepository;
    constructor(vehicleRepository: Repository<Vehicle>);
    run(): Promise<void>;
}
