import { ApiProperty } from '@nestjs/swagger';
import { ImageEnum } from '../../common/enum/entity.enum';

export class UploadedImageResponseDto {
	@ApiProperty({ description: 'Image ID' })
	id: string;

	@ApiProperty({ description: 'Image URL' })
	url: string;

	@ApiProperty({
		description: 'Image format (jpg, png, etc.)',
		required: false,
	})
	format?: string;

	@ApiProperty({ description: 'Image size in bytes' })
	size: number;

	@ApiProperty({
		description: 'Entity type this image belongs to',
		enum: ImageEnum,
	})
	entityType: ImageEnum;

	@ApiProperty({ description: 'Entity ID this image belongs to' })
	entityId: string;

	@ApiProperty({
		description: 'User who uploaded the image',
		required: false,
		example: { id: 'user-id', name: 'John Doe' },
	})
	uploadedBy?: {
		id: string;
		name: string;
	};

	@ApiProperty({ description: 'Creation timestamp' })
	createdAt: Date;

	@ApiProperty({ description: 'Last update timestamp' })
	updatedAt: Date;
}

export class MultipleUploadResponseDto {
	@ApiProperty({
		description: 'Array of uploaded images',
		type: [UploadedImageResponseDto],
	})
	images: UploadedImageResponseDto[];

	@ApiProperty({ description: 'Total number of images uploaded' })
	count: number;

	@ApiProperty({ description: 'Total size of all uploaded images in bytes' })
	totalSize: number;
}
