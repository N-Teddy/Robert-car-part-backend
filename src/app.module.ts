import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseService } from './common/services/supabase.service';

// Import all entities
import { User } from './entities/user.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleProfit } from './entities/vehicle-profit.entity';
import { Part } from './entities/part.entity';
import { Category } from './entities/category.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Report } from './entities/report.entity';
import { Notification } from './entities/notification.entity';
import { Image } from './entities/image.entity';
import { AuditLog } from './entities/audit-log.entity';
import { join } from 'path';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, appConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = configService.get('database');

        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          entities: [User, PasswordResetToken, Vehicle, VehicleProfit, Part, Category, Order, OrderItem, Report, Notification, Image, AuditLog,],
          synchronize: process.env.NODE_ENV !== 'production',
          ssl: db.ssl,
          extra: {
            pool: db.pool,
          },
        };
      },
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const rate = configService.get('app.rateLimit');
        return [
          {
            ttl: rate.windowMs,
            limit: rate.max,
          },
        ];
      },
    }),
  ],
})
export class AppModule {}
