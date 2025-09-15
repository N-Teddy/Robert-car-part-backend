import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsString,
	IsNotEmpty,
	IsNumber,
	IsDateString,
	IsOptional,
	IsBoolean,
	IsDate,
} from 'class-validator';

export class CreateVehicleDto {
	@ApiProperty({
		type: 'array',
		items: {
			type: 'string',
			format: 'binary',
		},
		description: 'Vehicle image files (optional)',
	})
	images?: any[];

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	make: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	model: string;

	@ApiProperty()
	@IsNumber()
	year: number;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	vin: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	description: string;

	@ApiProperty()
	@IsNumber()
	purchasePrice: number;

	@ApiProperty()
	@IsDateString()
	purchaseDate: string;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	auctionName?: string;

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	isPartedOut?: boolean;
}

export class UpdateVehicleDto {
	@ApiProperty({
		type: 'array',
		items: {
			type: 'string',
			format: 'binary',
		},
		description: 'Vehicles image files (optional)',
	})
	images?: any[];

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	make?: string;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	model?: string;

	@ApiPropertyOptional()
	@IsDate()
	@IsOptional()
	year?: Date;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	vin?: string;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional()
	@IsNumber()
	@IsOptional()
	purchasePrice?: number;

	@ApiPropertyOptional()
	@IsDateString()
	@IsOptional()
	purchaseDate?: string;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	auctionName?: string;

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	isPartedOut?: boolean;

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}

export class VehicleQueryDto {
	@ApiPropertyOptional({ description: 'Page number', example: 1 })
	@Type(() => Number)
	@IsOptional()
	@IsNumber()
	page?: number = 1;

	@ApiPropertyOptional({ description: 'Items per page', example: 10 })
	@Type(() => Number)
	@IsOptional()
	@IsNumber()
	limit?: number = 10;

	@ApiPropertyOptional({ description: 'Search keyword', example: 'Toyota' })
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({ description: 'Vehicle make', example: 'Honda' })
	@IsOptional()
	@IsString()
	make?: string;

	@ApiPropertyOptional({ description: 'Vehicle model', example: 'Civic' })
	@IsOptional()
	@IsString()
	model?: string;

	@ApiPropertyOptional({ description: 'Exact vehicle year', example: 2020 })
	@Type(() => Number)
	@IsOptional()
	@IsNumber()
	year?: number;

	@ApiPropertyOptional({ description: 'Minimum year', example: 2000 })
	@Type(() => Number)
	@IsOptional()
	@IsNumber()
	minYear?: number;

	@ApiPropertyOptional({ description: 'Maximum year', example: 2025 })
	@Type(() => Number)
	@IsOptional()
	@IsNumber()
	maxYear?: number;

	@ApiPropertyOptional({ description: 'Filter by parted out status', example: true })
	@Type(() => Boolean)
	@IsOptional()
	@IsBoolean()
	isPartedOut?: boolean;
}