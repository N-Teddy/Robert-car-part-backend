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
			}),
			inject: [ConfigService],
		}),
		// Serve static files for local development
		ServeStaticModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => {
				const isProduction =
					configService.get<string>('NODE_ENV') === 'production';
				if (!isProduction) {
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
	providers: [UploadService, LocalStorageService, CloudinaryService],
	exports: [UploadService],
})
export class UploadModule {}
