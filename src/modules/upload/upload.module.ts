import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { LocalStorageService } from './local-storage.service';
import { CloudinaryService } from './cloudinary.service';
import { Image } from '../../entities/image.entity';
import { User } from '../../entities/user.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Part } from '../../entities/part.entity';
import { Category } from '../../entities/category.entity';
import { QrCode } from '../../entities/qr-code.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Image,
			User,
			Vehicle,
			Part,
			Category,
			QrCode,
		]),
		MulterModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				limits: {
					fileSize:
						configService.get<number>('MAX_FILE_SIZE') || 10485760, // 10MB default
				},
				// Use memory storage in production/serverless
				storage: configService.get<string>('NODE_ENV') === 'production'
					? undefined // Use memory storage
					: undefined, // You can add disk storage for development if needed
			}),
			inject: [ConfigService],
		}),
		// Serve static files only in development
		ServeStaticModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => {
				const isProduction = configService.get<string>('NODE_ENV') === 'production';
				const isServerless = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

				// Only serve static files in development and non-serverless environments
				if (!isProduction && !isServerless) {
					return [
						{
							rootPath: join(process.cwd(), 'uploads'),
							serveRoot: '/uploads',
							serveStaticOptions: {
								index: false,
								fallthrough: false,
							},
						},
					];
				}
				return [];
			},
			inject: [ConfigService],
		}),
	],
	controllers: [UploadController],
	providers: [
		UploadService,
		{
			provide: 'STORAGE_SERVICE',
			useFactory: (configService: ConfigService) => {
				const isProduction = configService.get<string>('NODE_ENV') === 'production';
				const isServerless = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

				// Use CloudinaryService in production, LocalStorageService in development
				if (isProduction || isServerless) {
					return new CloudinaryService(configService);
				} else {
					return new LocalStorageService(configService);
				}
			},
			inject: [ConfigService],
		},
		// Provide both services for dependency injection
		LocalStorageService,
		CloudinaryService,
	],
	exports: [UploadService],
})
export class UploadModule {}