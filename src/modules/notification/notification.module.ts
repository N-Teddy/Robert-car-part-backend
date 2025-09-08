import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { EmailService } from './email.service';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Part } from '../../entities/part.entity';
import { Category } from '../../entities/category.entity';
import { QrCode } from '../../entities/qr-code.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Notification,
      User,
      Vehicle,
      Part,
      Category,
      QrCode,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationGateway,
    EmailService,
  ],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}