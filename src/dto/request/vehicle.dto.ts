import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
		description: 'Category image files (optional)',
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
