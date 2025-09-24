import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../entities/category.entity';
import { Image } from '../../entities/image.entity';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { UploadModule } from '../upload/upload.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Category, Image]),
		UploadModule,
		NotificationModule,
	],
	controllers: [CategoryController],
	providers: [CategoryService],
	exports: [CategoryService],
})
export class CategoryModule {}
