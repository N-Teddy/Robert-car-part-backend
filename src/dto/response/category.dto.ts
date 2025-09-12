import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Image } from '../../entities/image.entity';
import { Category } from '../../entities/category.entity';

export class CategoryResponseDto {
	@ApiProperty({ description: 'Category ID' })
	id: string;

	@ApiProperty({ description: 'Category name' })
	name: string;

	@ApiPropertyOptional({ description: 'Category description' })
	description?: string;

	@ApiPropertyOptional({
		description: 'Category image',
		type: Object,
	})
	image?: {
		id: string;
		url: string;
		publicId?: string;
		format?: string;
	};

	@ApiPropertyOptional({ description: 'Parent category ID' })
	parentId?: string;

	@ApiProperty({
		description: 'Child categories',
		type: [CategoryResponseDto],
		required: false,
	})
	children?: CategoryResponseDto[];

	@ApiProperty({ description: 'Creation date' })
	createdAt: Date;

	@ApiProperty({ description: 'Last update date' })
	updatedAt: Date;

	static fromEntity(entity: Category): CategoryResponseDto {
		const dto = new CategoryResponseDto();
		dto.id = entity.id;
		dto.name = entity.name;
		dto.description = entity.description;

		// Set parent ID if exists
		if (entity.parent) {
			dto.parentId = entity.parent.id;
		}

		// Handle image
		const img = entity.image as Image | undefined;
		if (img) {
			dto.image = {
				id: img.id,
				url: img.url,
				publicId: img.publicId,
				format: img.format,
			};
		}

		dto.createdAt = entity.createdAt;
		dto.updatedAt = entity.updatedAt;

		return dto;
	}

	// Additional method for tree responses
	static fromEntityWithChildren(entity: Category): CategoryResponseDto {
		const dto = this.fromEntity(entity);

		// Recursively add children if they exist
		if (entity.children && entity.children.length > 0) {
			dto.children = entity.children.map((child) =>
				this.fromEntityWithChildren(child)
			);
		}

		return dto;
	}
}
