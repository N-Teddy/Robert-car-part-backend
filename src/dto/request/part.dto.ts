import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
