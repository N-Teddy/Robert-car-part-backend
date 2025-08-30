import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { Vehicle } from '../../entities/vehicle.entity';
import { Part } from '../../entities/part.entity';
import { VehicleProfit } from '../../entities/vehicle-profit.entity';
import { Image } from '../../entities/image.entity';
import { User } from '../../entities/user.entity';
import { UploadModule } from '../upload/upload.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Vehicle, Part, VehicleProfit, Image, User]),
        UploadModule,
        NotificationModule,
    ],
    controllers: [VehicleController],
    providers: [VehicleService],
    exports: [VehicleService],
})
export class VehicleModule { }