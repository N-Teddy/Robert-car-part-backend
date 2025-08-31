// src/modules/category/dto/category-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ImageDto, ImagesResponseDto } from './upload.dto';

export class CategoryResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ nullable: true })
    description?: string;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    order: number;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty({ nullable: true })
    parentId?: string;

    @ApiProperty({ type: ImagesResponseDto, nullable: true })
    image?: ImagesResponseDto;

    @ApiProperty()
    partCount: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty({
        description: 'Vehicle images',
        type: [ImageDto],
    })
    images: ImageDto[];

    constructor(category: any) {
        this.id = category.id;
        this.name = category.name;
        this.description = category.description;
        this.slug = category.slug;
        this.order = category.order;
        this.isActive = category.isActive;
        this.parentId = category.parentId;
        this.image = category.image;
        this.partCount = category.partCount || 0;
        this.createdAt = category.createdAt;
        this.updatedAt = category.updatedAt;
    }
}