import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ImageEnum } from '../../common/enum/entity.enum';

export class UploadImageDto {
	@ApiProperty({
		description: 'Type of image being uploaded',
		enum: ImageEnum,
		example: ImageEnum.USER_PROFILE,
	})
	@IsEnum(ImageEnum)
	type: ImageEnum;

	@ApiProperty({
		description: 'ID of the entity this image belongs to (optional)',
		example: '123e4567-e89b-12d3-a456-426614174000',
		required: false,
	})
	@IsOptional()
	@IsUUID()
	entityId?: string;

	@ApiProperty({
		description: 'Type of entity this image belongs to (optional)',
		enum: ['user', 'vehicle', 'part'],
		example: 'user',
		required: false,
	})
	@IsOptional()
	@IsString()
	entityType?: string;

	@ApiProperty({
		description: 'Subfolder for organizing images (optional)',
		example: 'profile-photos',
		required: false,
	})
	@IsOptional()
	@IsString()
	folder?: string;
}

export class UpdateImageDto {
	@ApiProperty({
		description: 'Subfolder for organizing images (optional)',
		example: 'profile-photos',
		required: false,
	})
	@IsOptional()
	@IsString()
	folder?: string;
}

export class BulkUploadDto {
	@ApiProperty({
		description: 'Type of image being uploaded',
		enum: ImageEnum,
		example: ImageEnum.VEHICLE,
	})
	@IsEnum(ImageEnum)
	type: ImageEnum;

	@ApiProperty({
		description: 'ID of the entity these images belong to (optional)',
		example: '123e4567-e89b-12d3-a456-426614174000',
		required: false,
	})
	@IsOptional()
	@IsUUID()
	entityId?: string;

	@ApiProperty({
		description: 'Type of entity these images belong to (optional)',
		enum: ['user', 'vehicle', 'part'],
		example: 'vehicle',
		required: false,
	})
	@IsOptional()
	@IsString()
	entityType?: string;

	@ApiProperty({
		description: 'Subfolder for organizing images (optional)',
		example: 'vehicle-gallery',
		required: false,
	})
	@IsOptional()
	@IsString()
	folder?: string;
}
