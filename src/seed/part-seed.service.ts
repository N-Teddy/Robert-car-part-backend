import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Part } from '../entities/part.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Category } from '../entities/category.entity';
import { seedPartsData } from './data/parts.data';

@Injectable()
export class PartSeedService {
    private readonly logger = new Logger(PartSeedService.name);

    constructor(
        @InjectRepository(Part)
        private readonly partRepository: Repository<Part>,
        @InjectRepository(Vehicle)
        private readonly vehicleRepository: Repository<Vehicle>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async run() {
        for (const seed of seedPartsData) {
            const vehicle = await this.vehicleRepository.findOne({ where: { vin: seed.vehicleVin } });
            const category = await this.categoryRepository.findOne({ where: { name: seed.categoryName } });
            if (!vehicle || !category) {
                this.logger.warn(`Skipping part ${seed.partNumber}: missing vehicle or category`);
                continue;
            }
            const existing = await this.partRepository.findOne({ where: { partNumber: seed.partNumber } });
            const payload = {
                name: seed.name,
                description: seed.description,
                price: seed.price as any,
                quantity: seed.quantity,
                condition: seed.condition,
                partNumber: seed.partNumber,
                isFeatured: seed.isFeatured,
                vehicle,
                category,
            };
            if (existing) {
                await this.partRepository.update({ id: existing.id }, payload);
            } else {
                const created = this.partRepository.create(payload);
                await this.partRepository.save(created);
            }
        }
    }
}