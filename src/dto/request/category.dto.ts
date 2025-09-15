import {
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	IsInt,
	Min,
	IsUUID,
	IsNumber,
	Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
	@ApiProperty({
		type: 'string',
		format: 'binary',
		description: 'Category image file (optional)',
	})
	image?: any;

	@ApiProperty({ description: 'Category name', maxLength: 100 })
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@ApiPropertyOptional({
		description: 'Category description',
		maxLength: 500,
	})
	@IsString()
	@IsOptional()
	@MaxLength(500)
	description?: string;

	@ApiPropertyOptional({ description: 'Parent category ID' })
	@IsUUID()
	@IsOptional()
	parentId?: string;
}

export class CategoryTreeQueryDto {
	@ApiPropertyOptional({
		description: 'Page number',
		example: 1,
		default: 1,
	})
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Type(() => Number)
	page?: number = 1;

	@ApiPropertyOptional({
		description: 'Number of items per page',
		example: 10,
		default: 10,
	})
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(100) // Set a reasonable maximum limit
	@Type(() => Number)
	limit?: number = 10;

	@ApiPropertyOptional({
		description: 'Search term for category name or description',
		example: 'electronics',
	})
	@IsOptional()
	@IsString()
	search?: string;
}

export class UpdateCategoryDto {
	@ApiProperty({
		type: 'string',
		format: 'binary',
		description: 'Category image file (optional)',
	})
	image?: any;

	@ApiPropertyOptional({ description: 'Category name', maxLength: 100 })
	@IsString()
	@IsOptional()
	@MaxLength(100)
	name?: string;

	@ApiPropertyOptional({
		description: 'Category description',
		maxLength: 500,
	})
	@IsString()
	@IsOptional()
	@MaxLength(500)
	description?: string;

	@ApiPropertyOptional({
		description: 'Parent category ID (set to null for root)',
	})
	@Transform(({ value }) => {
		// Convert empty string to null, otherwise return the value as-is
		if (value === '') {
			return null;
		}
		return value;
	})
	@IsUUID()
	@IsOptional()
	parentId?: string | null;
}

export class CategoryQueryDto {
	@ApiProperty({
		example: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiProperty({
		example: 10,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	search?: string;
}
