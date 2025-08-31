import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { seedVehiclesData } from './data/vehicles.data';

@Injectable()
export class VehicleSeedService {
	constructor(
		@InjectRepository(Vehicle)
		private readonly vehicleRepository: Repository<Vehicle>
	) {}

	async run() {
		for (const seed of seedVehiclesData) {
			const existing = await this.vehicleRepository.findOne({
				where: { vin: seed.vin },
			});
			if (existing) {
				await this.vehicleRepository.update({ id: existing.id }, seed);
			} else {
				const created = this.vehicleRepository.create(seed);
				await this.vehicleRepository.save(created);
			}
		}
	}
}
