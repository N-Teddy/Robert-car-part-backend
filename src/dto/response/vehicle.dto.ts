import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Vehicle } from '../../entities/vehicle.entity';
import { Image } from '../../entities/image.entity';

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

		return dto;
	}
}
