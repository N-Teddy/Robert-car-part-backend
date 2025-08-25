import { OnModuleInit } from '@nestjs/common';
import { UserSeedService } from './user-seed.service';
import { CategorySeedService } from './category-seed.service';
import { VehicleSeedService } from './vehicle-seed.service';
import { PartSeedService } from './part-seed.service';
export declare class SeedModule implements OnModuleInit {
    private readonly userSeedService;
    private readonly categorySeedService;
    private readonly vehicleSeedService;
    private readonly partSeedService;
    constructor(userSeedService: UserSeedService, categorySeedService: CategorySeedService, vehicleSeedService: VehicleSeedService, partSeedService: PartSeedService);
    onModuleInit(): Promise<void>;
}
