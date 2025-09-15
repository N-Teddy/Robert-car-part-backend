// src/modules/vehicle/vehicle.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../../entities/vehicle.entity';
import { Image } from '../../entities/image.entity';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { UploadModule } from '../upload/upload.module';
import { NotificationModule } from '../notification/notification.module';
import { VehicleProfit } from 'src/entities/vehicle-profit.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Vehicle, Image, VehicleProfit]),
		UploadModule,
		NotificationModule,
	],
	controllers: [VehicleController],
	providers: [VehicleService],
	exports: [VehicleService],
})
export class VehicleModule {}
