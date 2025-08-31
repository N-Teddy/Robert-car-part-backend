import { ApiProperty } from '@nestjs/swagger';
import { ImageDto } from './upload.dto';

export class VehicleDto {
	@ApiProperty({
		description: 'Unique identifier of the vehicle',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	id: string;

	@ApiProperty({
		description: 'Vehicle make (brand)',
		example: 'Toyota',
	})
	make: string;

	@ApiProperty({
		description: 'Vehicle model',
		example: 'Camry',
	})
	model: string;

	@ApiProperty({
		description: 'Vehicle year',
		example: 2020,
	})
	year: number;

	@ApiProperty({
		description: 'Vehicle Identification Number (unique)',
		example: '1HGBH41JXMN109186',
	})
	vin: string;

	@ApiProperty({
		description: 'Vehicle description',
		example: 'Well-maintained sedan with low mileage',
	})
	description: string;

	@ApiProperty({
		description: 'Purchase price of the vehicle',
		example: 15000.0,
	})
	purchasePrice: number;

	@ApiProperty({
		description: 'Date when vehicle was purchased',
		example: '2024-01-15T00:00:00.000Z',
	})
	purchaseDate: Date;

	@ApiProperty({
		description:
			'Name of the auction where vehicle was purchased (optional)',
		example: 'Copart Auto Auction',
		required: false,
	})
	auctionName?: string;

	@ApiProperty({
		description: 'Whether the vehicle has been parted out',
		example: false,
	})
	isPartedOut: boolean;

	@ApiProperty({
		description: 'Total number of parts from this vehicle',
		example: 25,
	})
	totalParts: number;

	@ApiProperty({
		description: 'Total revenue from parts sold',
		example: 8500.0,
	})
	totalPartsRevenue: number;

	@ApiProperty({
		description: 'Total cost of parts',
		example: 3000.0,
	})
	totalPartsCost: number;

	@ApiProperty({
		description: 'Total profit from parts',
		example: 5500.0,
	})
	totalProfit: number;

	@ApiProperty({
		description: 'Profit margin percentage',
		example: 64.71,
	})
	profitMargin: number;

	@ApiProperty({
		description: 'Vehicle images',
		type: [ImageDto],
	})
	images: ImageDto[];

	@ApiProperty({
		description: 'User who created the vehicle',
		example: '123e4567-e89b-12d3-a456-426614174000',
		required: false,
	})
	createdBy?: string;

	@ApiProperty({
		description: 'User who last updated the vehicle',
		example: '123e4567-e89b-12d3-a456-426614174000',
		required: false,
	})
	updatedBy?: string;

	@ApiProperty({
		description: 'Creation timestamp',
		example: '2024-01-15T10:30:00.000Z',
	})
	createdAt: Date;

	@ApiProperty({
		description: 'Last update timestamp',
		example: '2024-01-20T14:45:00.000Z',
	})
	updatedAt: Date;
}

export class VehicleSummaryDto {
	@ApiProperty({
		description: 'Unique identifier of the vehicle',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	id: string;

	@ApiProperty({
		description: 'Vehicle make (brand)',
		example: 'Toyota',
	})
	make: string;

	@ApiProperty({
		description: 'Vehicle model',
		example: 'Camry',
	})
	model: string;

	@ApiProperty({
		description: 'Vehicle year',
		example: 2020,
	})
	year: number;

	@ApiProperty({
		description: 'Vehicle Identification Number (unique)',
		example: '1HGBH41JXMN109186',
	})
	vin: string;

	@ApiProperty({
		description: 'Purchase price of the vehicle',
		example: 15000.0,
	})
	purchasePrice: number;

	@ApiProperty({
		description: 'Date when vehicle was purchased',
		example: '2024-01-15T00:00:00.000Z',
	})
	purchaseDate: Date;

	@ApiProperty({
		description: 'Whether the vehicle has been parted out',
		example: false,
	})
	isPartedOut: boolean;

	@ApiProperty({
		description: 'Total profit from parts',
		example: 5500.0,
	})
	totalProfit: number;

	@ApiProperty({
		description: 'Main vehicle image',
		type: ImageDto,
		required: false,
	})
	mainImage?: ImageDto;

	@ApiProperty({
		description: 'Creation timestamp',
		example: '2024-01-15T10:30:00.000Z',
	})
	createdAt: Date;
}

export class VehicleResponseDto {
	@ApiProperty({
		description: 'Success message',
		example: 'Vehicle retrieved successfully',
	})
	message: string;

	@ApiProperty({
		description: 'Vehicle data',
		type: VehicleDto,
	})
	data: VehicleDto;
}

export class PaginationMetaDto {
	@ApiProperty({
		description: 'Current page number',
		example: 1,
	})
	page: number;

	@ApiProperty({
		description: 'Number of items per page',
		example: 10,
	})
	limit: number;

	@ApiProperty({
		description: 'Total number of items',
		example: 150,
	})
	total: number;

	@ApiProperty({
		description: 'Total number of pages',
		example: 15,
	})
	totalPages: number;

	@ApiProperty({
		description: 'Whether there is a next page',
		example: true,
	})
	hasNextPage: boolean;

	@ApiProperty({
		description: 'Whether there is a previous page',
		example: false,
	})
	hasPrevPage: boolean;
}

export class VehiclesResponseDto {
	@ApiProperty({
		description: 'Success message',
		example: 'Vehicles retrieved successfully',
	})
	message: string;

	@ApiProperty({
		description: 'Array of vehicles',
		type: [VehicleSummaryDto],
	})
	data: VehicleSummaryDto[];

	@ApiProperty({
		description: 'Pagination information',
		type: PaginationMetaDto,
	})
	meta: PaginationMetaDto;
}

export class VehicleStatsDto {
	@ApiProperty({
		description: 'Total number of vehicles',
		example: 150,
	})
	totalVehicles: number;

	@ApiProperty({
		description: 'Number of vehicles that have been parted out',
		example: 45,
	})
	partedOutVehicles: number;

	@ApiProperty({
		description: 'Number of vehicles still intact',
		example: 105,
	})
	intactVehicles: number;

	@ApiProperty({
		description: 'Total purchase cost of all vehicles',
		example: 2250000.0,
	})
	totalPurchaseCost: number;

	@ApiProperty({
		description: 'Total revenue from all parts sold',
		example: 1875000.0,
	})
	totalPartsRevenue: number;

	@ApiProperty({
		description: 'Total profit from all parts',
		example: 1125000.0,
	})
	totalProfit: number;

	@ApiProperty({
		description: 'Average profit per vehicle',
		example: 7500.0,
	})
	averageProfitPerVehicle: number;

	@ApiProperty({
		description: 'Overall profit margin percentage',
		example: 60.0,
	})
	overallProfitMargin: number;

	@ApiProperty({
		description: 'Breakdown by make',
		example: {
			Toyota: 25,
			Honda: 20,
			Ford: 15,
		},
	})
	makeBreakdown: Record<string, number>;

	@ApiProperty({
		description: 'Breakdown by year range',
		example: {
			'2015-2019': 45,
			'2020-2024': 105,
		},
	})
	yearBreakdown: Record<string, number>;
}

export class VehicleStatsResponseDto {
	@ApiProperty({
		description: 'Success message',
		example: 'Vehicle statistics retrieved successfully',
	})
	message: string;

	@ApiProperty({
		description: 'Vehicle statistics data',
		type: VehicleStatsDto,
	})
	data: VehicleStatsDto;
}

export class BulkOperationResultDto {
	@ApiProperty({
		description: 'Vehicle ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
		required: false,
	})
	id?: string;

	@ApiProperty({
		description: 'Operation result data',
		type: VehicleDto,
		required: false,
	})
	data?: VehicleDto;

	@ApiProperty({
		description: 'Error message if operation failed',
		example: 'VIN already exists',
		required: false,
	})
	error?: string;

	@ApiProperty({
		description: 'Index of the item in the bulk operation',
		example: 0,
	})
	index: number;
}

export class BulkCreateResponseDto {
	@ApiProperty({
		description: 'Success message',
		example: 'Bulk vehicle creation completed',
	})
	message: string;

	@ApiProperty({
		description: 'Array of operation results',
		type: [BulkOperationResultDto],
	})
	data: BulkOperationResultDto[];

	@ApiProperty({
		description: 'Summary of the operation',
		example: {
			total: 5,
			successful: 4,
			failed: 1,
		},
	})
	summary: {
		total: number;
		successful: number;
		failed: number;
	};
}

export class BulkUpdateResponseDto {
	@ApiProperty({
		description: 'Success message',
		example: 'Bulk vehicle update completed',
	})
	message: string;

	@ApiProperty({
		description: 'Array of operation results',
		type: [BulkOperationResultDto],
	})
	data: BulkOperationResultDto[];

	@ApiProperty({
		description: 'Summary of the operation',
		example: {
			total: 5,
			successful: 4,
			failed: 1,
		},
	})
	summary: {
		total: number;
		successful: number;
		failed: number;
	};
}

export class VehicleExportResponseDto {
	@ApiProperty({
		description: 'Success message',
		example: 'Vehicle export completed successfully',
	})
	message: string;

	@ApiProperty({
		description: 'Export file URL or data',
		example: 'http://localhost:3000/exports/vehicles-2024-01-15.csv',
	})
	data: string;

	@ApiProperty({
		description: 'Export format',
		example: 'csv',
	})
	format: string;

	@ApiProperty({
		description: 'Number of vehicles exported',
		example: 150,
	})
	count: number;
}
