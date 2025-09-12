import {
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	IsInt,
	Min,
	IsUUID,
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
