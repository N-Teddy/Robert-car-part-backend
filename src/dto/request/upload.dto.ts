import { IsEnum, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImageEnum } from '../../common/enum/entity.enum';

export class UploadImageDto {
	@ApiProperty({
		description: 'Type of entity the image belongs to',
		enum: ImageEnum,
	})
	@IsEnum(ImageEnum)
	entityType: ImageEnum;

	@ApiProperty({
		description: 'ID of the entity this image belongs to',
	})
	@IsUUID()
	entityId: string;

	@ApiPropertyOptional({
		description: 'Additional metadata for the image',
	})
	@IsOptional()
	metadata?: Record<string, any>;
}

export class UploadMultipleImagesDto {
	@ApiProperty({
		description: 'Type of entity the images belong to',
		enum: ImageEnum,
	})
	@IsEnum(ImageEnum)
	entityType: ImageEnum;

	@ApiProperty({
		description: 'ID of the entity these images belong to',
	})
	@IsUUID()
	entityId: string;

	@ApiPropertyOptional({
		description: 'Additional metadata for the images',
	})
	@IsOptional()
	metadata?: Record<string, any>;
}

export class DeleteImageDto {
	@ApiProperty({
		description: 'ID of the image to delete',
	})
	@IsUUID()
	imageId: string;
}
