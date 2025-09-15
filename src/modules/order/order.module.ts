// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderItem } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';
import { Part } from 'src/entities/part.entity';
import { NotificationModule } from '../notification/notification.module';
import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';
import { PDFService } from 'src/common/services/pdf.service';
import { VehicleProfit } from 'src/entities/vehicle-profit.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Order, OrderItem, Part, VehicleProfit]),
		NotificationModule,
	],
	controllers: [OrdersController],
	providers: [OrdersService, PDFService],
	exports: [OrdersService, PDFService],
})
export class OrdersModule { }
