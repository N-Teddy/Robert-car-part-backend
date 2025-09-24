// src/modules/report/report.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Report } from 'src/entities/report.entity';
import { Order } from 'src/entities/order.entity';
import { Part } from 'src/entities/part.entity';
import { VehicleProfit } from 'src/entities/vehicle-profit.entity';
import { Vehicle } from 'src/entities/vehicle.entity';
import { PDFService } from 'src/common/services/pdf.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Report, Order, Part, VehicleProfit, Vehicle]),
	],
	controllers: [ReportController],
	providers: [ReportService, PDFService],
	exports: [ReportService, PDFService],
})
export class ReportModule {}
