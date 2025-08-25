import { Repository } from 'typeorm';
import { Part } from '../entities/part.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Category } from '../entities/category.entity';
export declare class PartSeedService {
    private readonly partRepository;
    private readonly vehicleRepository;
    private readonly categoryRepository;
    private readonly logger;
    constructor(partRepository: Repository<Part>, vehicleRepository: Repository<Vehicle>, categoryRepository: Repository<Category>);
    run(): Promise<void>;
}
