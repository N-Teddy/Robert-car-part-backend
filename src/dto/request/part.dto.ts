import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
	IsString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsUUID,
	Min,
	Max,
} from 'class-validator';

export class CreatePartDto {
	@ApiProperty({
		type: 'array',
		items: {
			type: 'string',
			format: 'binary',
		},
		description: 'Part image files (optional)',
	})
	images?: any[];

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	description: string;

	@ApiProperty()
	@IsNumber()
	@Min(0)
	price: number;

	@ApiProperty()
	@IsNumber()
	@Min(0)
	quantity: number;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	condition?: string;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	partNumber?: string;

	@ApiProperty()
	@IsUUID()
	vehicleId: string;

	@ApiProperty()
	@IsUUID()
	categoryId: string;
}

export class UpdatePartDto {
	@ApiProperty({
		type: 'array',
		items: {
			type: 'string',
			format: 'binary',
		},
		description: 'Part image files (optional)',
	})
	images?: any[];

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	name?: string;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional()
	@IsNumber()
	@Min(0)
	@IsOptional()
	price?: number;

	@ApiPropertyOptional()
	@IsNumber()
	@Min(0)
	@IsOptional()
	quantity?: number;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	condition?: string;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	partNumber?: string;

	@ApiPropertyOptional()
	@IsUUID()
	@IsOptional()
	vehicleId?: string;

	@ApiPropertyOptional()
	@IsUUID()
	@IsOptional()
	categoryId?: string;
}

export class PartsQueryDto {
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
	@Max(100)
	@Type(() => Number)
	limit?: number = 10;

	@ApiPropertyOptional({
		description: 'Search term for part name, description, or SKU',
		example: 'brake pad',
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }) => value?.trim())
	search?: string;

	@ApiPropertyOptional({
		description: 'Filter by vehicle ID',
		example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
	})
	@IsOptional()
	@IsUUID()
	vehicleId?: string;

	@ApiPropertyOptional({
		description: 'Filter by category ID',
		example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
	})
	@IsOptional()
	@IsUUID()
	categoryId?: string;

	@ApiPropertyOptional({
		description: 'Minimum price filter',
		example: 10.99,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	minPrice?: number;

	@ApiPropertyOptional({
		description: 'Maximum price filter',
		example: 100.99,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	maxPrice?: number;

	@ApiPropertyOptional({
		description: 'Minimum quantity filter',
		example: 5,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	minQuantity?: number;

	@ApiPropertyOptional({
		description: 'Maximum quantity filter',
		example: 100,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	maxQuantity?: number;

	@ApiPropertyOptional({
		description: 'Filter by condition (NEW, USED, REFURBISHED)',
		example: 'NEW',
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }) => value?.trim().toUpperCase())
	condition?: string;
}