import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Part } from '../entities/part.entity';
import { UserSeedService } from './user-seed.service';
import { CategorySeedService } from './category-seed.service';
import { VehicleSeedService } from './vehicle-seed.service';
import { PartSeedService } from './part-seed.service';

@Module({
	imports: [TypeOrmModule.forFeature([User, Category, Vehicle, Part])],
	providers: [
		UserSeedService,
		CategorySeedService,
		VehicleSeedService,
		PartSeedService,
	],
})
export class SeedModule implements OnModuleInit {
	constructor(
		private readonly userSeedService: UserSeedService,
		private readonly categorySeedService: CategorySeedService,
		private readonly vehicleSeedService: VehicleSeedService,
		private readonly partSeedService: PartSeedService
	) {}

	async onModuleInit() {
		await this.userSeedService.run();
		// await this.categorySeedService.run();
		await this.vehicleSeedService.run();
		// await this.partSeedService.run();
	}
}
