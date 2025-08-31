
import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CategoryResponseDto } from '../response/category.dto';

export class CreateCategoryDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    parentId?: string;

    @ApiProperty({ required: false, default: 0 })
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiProperty({ required: false, default: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    imageId?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }


export class CategoryQueryDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    parentId?: string;

    @ApiProperty({ required: false, default: 1 })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    page?: number = 1;

    @ApiProperty({ required: false, default: 10 })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    limit?: number = 10;

    @ApiProperty({ required: false, enum: ['name', 'createdAt', 'order'], default: 'name' })
    @IsString()
    @IsOptional()
    sortBy?: string = 'name';

    @ApiProperty({ required: false, enum: ['ASC', 'DESC'], default: 'ASC' })
    @IsString()
    @IsOptional()
    sortOrder?: 'ASC' | 'DESC' = 'ASC';

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class CategoryTreeDto extends CategoryResponseDto {
    @ApiProperty({ type: () => [CategoryTreeDto] })
    children: CategoryTreeDto[];

    @ApiProperty()
    depth: number;

    constructor(category: any, depth: number = 0) {
        super(category);
        this.depth = depth;
        this.children = category.children
            ? category.children.map((child: any) => new CategoryTreeDto(child, depth + 1))
            : [];
    }
}