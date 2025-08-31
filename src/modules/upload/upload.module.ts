import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { Image } from '../../entities/image.entity';
import { CloudinaryService } from './cloudinary.service';
import { LocalStorageService } from './local-storage.service';
import { StaticFileMiddleware } from './static-file.middleware';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/entities/user.entity';

@Module({
	imports: [
		MulterModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const isProduction =
					configService.get('app.environment') === 'production';

				if (isProduction) {
					// For production, we'll use memory storage and upload to Cloudinary
					return {
						storage: undefined, // Use memory storage
						limits: {
							fileSize: 5 * 1024 * 1024, // 5MB limit
						},
					};
				} else {
					// For development, store locally
					return {
						storage: diskStorage({
							destination: (req, file, cb) => {
								// For local storage, we'll use a temporary location
								// The actual organization will be handled by LocalStorageService
								const uploadPath = `./uploads/temp`;
								cb(null, uploadPath);
							},
							filename: (req, file, cb) => {
								// Use the original filename with a unique prefix
								const uniqueName = `${uuidv4()}-${file.originalname}`;
								cb(null, uniqueName);
							},
						}),
						limits: {
							fileSize: 5 * 1024 * 1024, // 5MB limit
						},
					};
				}
			},
		}),
		TypeOrmModule.forFeature([Image, User]),
	],
	controllers: [UploadController],
	providers: [UploadService, CloudinaryService, LocalStorageService],
	exports: [UploadService],
})
export class UploadModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(StaticFileMiddleware)
			.forRoutes({ path: 'uploads/*', method: RequestMethod.GET });
	}
}
