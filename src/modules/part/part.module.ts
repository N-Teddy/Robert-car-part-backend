// src/modules/part/part.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Part } from '../../entities/part.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Category } from '../../entities/category.entity';
import { QrCode } from '../../entities/qr-code.entity';
import { Image } from '../../entities/image.entity';
import { PartService } from './part.service';
import { PartController } from './part.controller';
import { UploadModule } from '../upload/upload.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Part, Vehicle, Category, QrCode, Image]),
		UploadModule,
		NotificationModule,
	],
	controllers: [PartController],
	providers: [PartService],
	exports: [PartService],
})
export class PartModule {}
