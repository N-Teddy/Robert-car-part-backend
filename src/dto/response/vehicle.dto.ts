import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Vehicle } from '../../entities/vehicle.entity';
import { Image } from '../../entities/image.entity';
import { VehicleProfit } from 'src/entities/vehicle-profit.entity';

export class VehicleResponseDto {
	@ApiProperty()
	id: string;

	@ApiProperty()
	make: string;

	@ApiProperty()
	model: string;

	@ApiProperty()
	year: number;

	@ApiProperty()
	vin: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	purchasePrice: number;

	@ApiProperty()
	purchaseDate: Date;

	@ApiPropertyOptional()
	auctionName?: string;

	@ApiProperty()
	isPartedOut: boolean;

	@ApiProperty()
	isActive: boolean;

	@ApiPropertyOptional({ type: [Object] })
	images?: Array<{
		id: string;
		url: string;
		publicId?: string;
		format?: string;
	}>;

	@ApiPropertyOptional({ type: VehicleProfit })
	profitRecord?: {
		totalPartsRevenue: number;
		totalPartsCost: number;
		profit: number;
		profitMargin: number;
		isThresholdMet: boolean;
		createdAt: Date;
		updatedAt: Date;
	};

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	static fromEntity(entity: Vehicle): VehicleResponseDto {
		const dto = new VehicleResponseDto();
		dto.id = entity.id;
		dto.make = entity.make;
		dto.model = entity.model;
		dto.year = entity.year;
		dto.vin = entity.vin;
		dto.description = entity.description;
		dto.purchasePrice = entity.purchasePrice;
		dto.purchaseDate = entity.purchaseDate;
		dto.auctionName = entity.auctionName;
		dto.isPartedOut = entity.isPartedOut;
		dto.isActive = entity.isActive;
		dto.createdAt = entity.createdAt;
		dto.updatedAt = entity.updatedAt;

		if (entity.images && entity.images.length > 0) {
			dto.images = entity.images.map((img: Image) => ({
				id: img.id,
				url: img.url,
				publicId: img.publicId,
				format: img.format,
			}));
		}

		// Add profit record if available
		if (entity.profitRecords && entity.profitRecords.length > 0) {
			const profitRecord = entity.profitRecords[0];
			dto.profitRecord = {
				totalPartsRevenue: profitRecord.totalPartsRevenue,
				totalPartsCost: profitRecord.totalPartsCost,
				profit: profitRecord.profit,
				profitMargin: profitRecord.profitMargin,
				isThresholdMet: profitRecord.isThresholdMet,
				createdAt: profitRecord.createdAt,
				updatedAt: profitRecord.updatedAt,
			};
		}

		return dto;
	}
}

export class VehicleProfitResponseDto {
	@ApiProperty()
	id: string;

	@ApiProperty({ description: 'Total revenue from parts sales for this vehicle' })
	totalPartsRevenue: number;

	@ApiProperty({ description: 'Total cost of parts sold for this vehicle' })
	totalPartsCost: number;

	@ApiProperty({ description: 'Profit (revenue - cost)' })
	profit: number;

	@ApiProperty({ description: 'Profit margin percentage (profit / revenue * 100)' })
	profitMargin: number;

	@ApiProperty({ description: 'Whether the profit margin meets the threshold' })
	isThresholdMet: boolean;

	@ApiProperty({ description: 'Vehicle ID associated with this profit record' })
	vehicleId: string;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	static fromEntity(entity: VehicleProfit): VehicleProfitResponseDto {
		const dto = new VehicleProfitResponseDto();
		dto.id = entity.id;
		dto.totalPartsRevenue = entity.totalPartsRevenue;
		dto.totalPartsCost = entity.totalPartsCost;
		dto.profit = entity.profit;
		dto.profitMargin = entity.profitMargin;
		dto.isThresholdMet = entity.isThresholdMet;
		dto.vehicleId = entity.vehicle?.id;
		dto.createdAt = entity.createdAt;
		dto.updatedAt = entity.updatedAt;
		return dto;
	}
}

export class VehicleProfitStatsResponseDto {
	@ApiProperty({ description: 'Total revenue from all vehicle parts sales' })
	totalRevenue: number;

	@ApiProperty({ description: 'Total cost of all parts sold' })
	totalCost: number;

	@ApiProperty({ description: 'Total profit across all vehicles' })
	totalProfit: number;

	@ApiProperty({ description: 'Average profit margin percentage across all vehicles' })
	avgProfitMargin: number;

	@ApiProperty({ description: 'Number of vehicles that have generated profit' })
	profitableVehicles: number;

	@ApiProperty({ description: 'Percentage of vehicles that are profitable' })
	profitabilityRate: number;

	@ApiProperty({ description: 'Total number of vehicles' })
	totalVehicles: number;

	@ApiProperty({ description: 'Number of active vehicles' })
	activeVehicles: number;

	@ApiProperty({ description: 'Number of vehicles that have been parted out' })
	partedOutVehicles: number;

	@ApiProperty({ description: 'Number of vehicles purchased this year' })
	vehiclesThisYear: number;
}
