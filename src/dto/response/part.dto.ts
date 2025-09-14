// src/dto/response/part.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Part } from '../../entities/part.entity';
import { Image } from '../../entities/image.entity';
import { QrCode } from '../../entities/qr-code.entity';

export class PartResponseDto {
	@ApiProperty()
	id: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	price: number;

	@ApiProperty()
	quantity: number;

	@ApiPropertyOptional()
	condition?: string;

	@ApiPropertyOptional()
	partNumber?: string;

	@ApiProperty()
	vehicleId: string;

	@ApiProperty()
	categoryId: string;

	@ApiPropertyOptional()
	qrCodeUrl?: string;

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

	static fromEntity(entity: Part): PartResponseDto {
		const dto = new PartResponseDto();
		dto.id = entity.id;
		dto.name = entity.name;
		dto.description = entity.description;
		dto.price = entity.price;
		dto.quantity = entity.quantity;
		dto.condition = entity.condition;
		dto.partNumber = entity.partNumber;
		dto.vehicleId = entity.vehicle?.id;
		dto.categoryId = entity.category?.id;
		dto.createdAt = entity.createdAt;
		dto.updatedAt = entity.updatedAt;

		// Add QR code URL if exists
		if (entity.qrCode?.image?.url) {
			dto.qrCodeUrl = entity.qrCode.image.url;
		}

		// Add images if exists
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
