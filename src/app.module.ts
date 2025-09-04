import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseService } from './common/services/supabase.service';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SeedModule } from './seed/seed.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';

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
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import supabaseConfig from './config/supabase.config';
import jwtConfig from './config/jwt.config';
import emailConfig from './config/email.config';
import { UserModule } from './modules/user/user.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { AuditLogInterceptor } from './common/interceptor/audit-log.interceptor';
import { CategoryModule } from './modules/category/category.module';

@Module({
	imports: [
		// Load environment variables and configurations
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
			load: [
				databaseConfig,
				appConfig,
				supabaseConfig,
				jwtConfig,
				emailConfig,
			],
		}),

		// Dynamically configure TypeORM based on the environment
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const isProduction = process.env.NODE_ENV === 'production';
				let connectionOptions: any;

				if (isProduction) {
					// Use Supabase database URL for production
					const supabaseDbUrl = configService.get<string>(
						'supabase.databaseUrl'
					);
					if (!supabaseDbUrl) {
						throw new Error(
							'SUPABASE_DATABASE_URL is not defined in production environment.'
						);
					}
					connectionOptions = {
						type: 'postgres',
						url: supabaseDbUrl, // Use the single URL connection string
						ssl: {
							rejectUnauthorized: false,
						},
						synchronize: true, // It's highly recommended to set this to false in production
						entities: [
							User,
							PasswordResetToken,
							Vehicle,
							VehicleProfit,
							Part,
							Category,
							Order,
							OrderItem,
							Report,
							Notification,
							Image,
							AuditLog,
						],
					};
				} else {
					// Use local database configuration for development
					const db = configService.get('database');
					connectionOptions = {
						type: 'postgres',
						host: db.host,
						port: db.port,
						username: db.username,
						password: db.password,
						database: db.database,
						entities: [
							User,
							PasswordResetToken,
							Vehicle,
							VehicleProfit,
							Part,
							Category,
							Order,
							OrderItem,
							Report,
							Notification,
							Image,
							AuditLog,
						],
						synchronize: true, // Use synchronize in development
						ssl: false, // Don't use SSL for local connections
						extra: {
							pool: db.pool,
						},
					};
				}

				return connectionOptions;
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
		AuthModule,
		NotificationModule,
		SeedModule,
		UserModule,
		VehicleModule,
		AuditLogModule,
		CategoryModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		SupabaseService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: AuditLogInterceptor,
		},
	],
})
export class AppModule {}
