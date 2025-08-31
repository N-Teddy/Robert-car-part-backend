import {
	IsString,
	IsNumber,
	IsOptional,
	IsBoolean,
	IsDateString,
	IsUUID,
	IsArray,
	ValidateNested,
	Min,
	Max,
	IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from '../../common/enum/entity.enum';

export class CreateVehicleDto {
	@ApiProperty({
		description: 'Vehicle make (brand)',
		example: 'Toyota',
	})
	@IsString()
	make: string;

	@ApiProperty({
		description: 'Vehicle model',
		example: 'Camry',
	})
	@IsString()
	model: string;

	@ApiProperty({
		description: 'Vehicle year',
		example: 2020,
		minimum: 1900,
		maximum: 2030,
	})
	@IsNumber()
	@Min(1900)
	@Max(2030)
	year: number;

	@ApiProperty({
		description: 'Vehicle Identification Number (unique)',
		example: '1HGBH41JXMN109186',
	})
	@IsString()
	vin: string;

	@ApiProperty({
		description: 'Vehicle description',
		example: 'Well-maintained sedan with low mileage',
	})
	@IsString()
	description: string;

	@ApiProperty({
		description: 'Purchase price of the vehicle',
		example: 15000.0,
		minimum: 0,
	})
	@IsNumber()
	@Min(0)
	purchasePrice: number;

	@ApiProperty({
		description: 'Date when vehicle was purchased',
		example: '2024-01-15',
	})
	@IsDateString()
	purchaseDate: string;

	@ApiProperty({
		description:
			'Name of the auction where vehicle was purchased (optional)',
		example: 'Copart Auto Auction',
		required: false,
	})
	@IsOptional()
	@IsString()
	auctionName?: string;

	@ApiProperty({
		description: 'Whether the vehicle has been parted out',
		example: false,
		default: false,
	})
	@IsOptional()
	@IsBoolean()
	isPartedOut?: boolean;
}

export class UpdateVehicleDto {
	@ApiProperty({
		description: 'Vehicle make (brand)',
		example: 'Toyota',
		required: false,
	})
	@IsOptional()
	@IsString()
	make?: string;

	@ApiProperty({
		description: 'Vehicle model',
		example: 'Camry',
		required: false,
	})
	@IsOptional()
	@IsString()
	model?: string;

	@ApiProperty({
		description: 'Vehicle year',
		example: 2020,
		minimum: 1900,
		maximum: 2030,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(1900)
	@Max(2030)
	year?: number;

	@ApiProperty({
		description: 'Vehicle Identification Number (unique)',
		example: '1HGBH41JXMN109186',
		required: false,
	})
	@IsOptional()
	@IsString()
	vin?: string;

	@ApiProperty({
		description: 'Vehicle description',
		example: 'Well-maintained sedan with low mileage',
		required: false,
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		description: 'Purchase price of the vehicle',
		example: 15000.0,
		minimum: 0,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	purchasePrice?: number;

	@ApiProperty({
		description: 'Date when vehicle was purchased',
		example: '2024-01-15',
		required: false,
	})
	@IsOptional()
	@IsDateString()
	purchaseDate?: string;

	@ApiProperty({
		description:
			'Name of the auction where vehicle was purchased (optional)',
		example: 'Copart Auto Auction',
		required: false,
	})
	@IsOptional()
	@IsString()
	auctionName?: string;

	@ApiProperty({
		description: 'Whether the vehicle has been parted out',
		example: false,
		required: false,
	})
	@IsOptional()
	@IsBoolean()
	isPartedOut?: boolean;
}

export class BulkCreateVehicleDto {
	@ApiProperty({
		description: 'Array of vehicles to create',
		type: [CreateVehicleDto],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateVehicleDto)
	vehicles: CreateVehicleDto[];
}

export class BulkUpdateVehicleItemDto {
	@ApiProperty({
		description: 'Vehicle ID to update',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@IsUUID()
	id: string;

	@ApiProperty({
		description: 'Vehicle data to update',
		type: UpdateVehicleDto,
	})
	@ValidateNested()
	@Type(() => UpdateVehicleDto)
	data: UpdateVehicleDto;
}

export class BulkUpdateVehicleDto {
	@ApiProperty({
		description: 'Array of vehicle updates with IDs',
		type: [BulkUpdateVehicleItemDto],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => BulkUpdateVehicleItemDto)
	vehicles: BulkUpdateVehicleItemDto[];
}

export class VehicleSearchDto {
	@ApiProperty({
		description: 'Search by vehicle make',
		example: 'Toyota',
		required: false,
	})
	@IsOptional()
	@IsString()
	make?: string;

	@ApiProperty({
		description: 'Search by vehicle model',
		example: 'Camry',
		required: false,
	})
	@IsOptional()
	@IsString()
	model?: string;

	@ApiProperty({
		description: 'Search by vehicle year',
		example: 2020,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	year?: number;

	@ApiProperty({
		description: 'Search by VIN (partial match)',
		example: '1HGBH',
		required: false,
	})
	@IsOptional()
	@IsString()
	vin?: string;

	@ApiProperty({
		description: 'Filter by parted out status',
		example: false,
		required: false,
	})
	@IsOptional()
	@IsBoolean()
	isPartedOut?: boolean;

	@ApiProperty({
		description: 'Minimum purchase price',
		example: 10000,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	minPrice?: number;

	@ApiProperty({
		description: 'Maximum purchase price',
		example: 25000,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	maxPrice?: number;

	@ApiProperty({
		description: 'Purchase date from (YYYY-MM-DD)',
		example: '2024-01-01',
		required: false,
	})
	@IsOptional()
	@IsDateString()
	purchaseDateFrom?: string;

	@ApiProperty({
		description: 'Purchase date to (YYYY-MM-DD)',
		example: '2024-12-31',
		required: false,
	})
	@IsOptional()
	@IsDateString()
	purchaseDateTo?: string;
}

export class VehiclePaginationDto {
	@ApiProperty({
		description: 'Page number (1-based)',
		example: 1,
		default: 1,
		minimum: 1,
	})
	@IsOptional()
	@IsNumber()
	@Min(1)
	page?: number = 1;

	@ApiProperty({
		description: 'Number of items per page',
		example: 10,
		default: 10,
		minimum: 1,
		maximum: 100,
	})
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(100)
	limit?: number = 10;

	@ApiProperty({
		description: 'Sort field',
		example: 'createdAt',
		enum: [
			'make',
			'model',
			'year',
			'purchasePrice',
			'purchaseDate',
			'createdAt',
			'updatedAt',
		],
		default: 'createdAt',
	})
	@IsOptional()
	@IsString()
	sortBy?: string = 'createdAt';

	@ApiProperty({
		description: 'Sort order',
		example: 'DESC',
		enum: ['ASC', 'DESC'],
		default: 'DESC',
	})
	@IsOptional()
	@IsEnum(['ASC', 'DESC'])
	sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class VehicleExportDto {
	@ApiProperty({
		description: 'Export format',
		example: 'csv',
		enum: ['csv', 'pdf'],
		default: 'csv',
	})
	@IsOptional()
	@IsEnum(['csv', 'pdf'])
	format?: 'csv' | 'pdf' = 'csv';

	@ApiProperty({
		description: 'Search criteria for export',
		type: VehicleSearchDto,
		required: false,
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => VehicleSearchDto)
	search?: VehicleSearchDto;
}
