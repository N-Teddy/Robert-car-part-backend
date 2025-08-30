import { ApiProperty } from '@nestjs/swagger';
import { ImageEnum } from '../../common/enum/entity.enum';

export class UploadResultDto {
    @ApiProperty({
        description: 'URL of the uploaded image',
        example: 'https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image.jpg',
    })
    url: string;

    @ApiProperty({
        description: 'Unique identifier of the uploaded image',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    imageId: string;

    @ApiProperty({
        description: 'Type of the uploaded image',
        enum: ImageEnum,
        example: ImageEnum.USER_PROFILE,
    })
    type: ImageEnum;

    @ApiProperty({
        description: 'ID of the entity this image belongs to (optional)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    entityId?: string;

    @ApiProperty({
        description: 'Type of entity this image belongs to (optional)',
        example: 'user',
        required: false,
    })
    entityType?: string;
}

export class UploadResponseDto {
    @ApiProperty({
        description: 'Success message',
        example: 'Image uploaded successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Upload result data',
        type: UploadResultDto,
    })
    data: UploadResultDto;
}

export class BulkUploadResultDto {
    @ApiProperty({
        description: 'Upload result for a single file',
        type: UploadResultDto,
        required: false,
    })
    data?: UploadResultDto;

    @ApiProperty({
        description: 'Error message if upload failed',
        example: 'File too large',
        required: false,
    })
    error?: string;

    @ApiProperty({
        description: 'Original filename',
        example: 'profile.jpg',
        required: false,
    })
    filename?: string;
}

export class BulkUploadResponseDto {
    @ApiProperty({
        description: 'Success message',
        example: 'Bulk upload completed',
    })
    message: string;

    @ApiProperty({
        description: 'Array of upload results',
        type: [BulkUploadResultDto],
    })
    data: BulkUploadResultDto[];
}

export class UploadStatsDto {
    @ApiProperty({
        description: 'Total number of uploaded files',
        example: 150,
    })
    totalFiles: number;

    @ApiProperty({
        description: 'Total size of all uploaded files in bytes',
        example: 52428800,
    })
    totalSize: number;

    @ApiProperty({
        description: 'Breakdown of files by type',
        example: {
            'USER PROFILE': 25,
            'VEHICLE': 100,
            'PART': 25,
        },
    })
    typeBreakdown: Record<string, number>;

    @ApiProperty({
        description: 'Storage type being used',
        example: 'cloudinary',
        enum: ['cloudinary', 'local'],
    })
    storage: string;
}

export class UploadStatsResponseDto {
    @ApiProperty({
        description: 'Success message',
        example: 'Upload statistics retrieved successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Upload statistics data',
        type: UploadStatsDto,
    })
    data: UploadStatsDto;
}

export class ImageDto {
    @ApiProperty({
        description: 'Unique identifier of the image',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'URL of the image',
        example: 'https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image.jpg',
    })
    url: string;

    @ApiProperty({
        description: 'Type of the image',
        enum: ImageEnum,
        example: ImageEnum.USER_PROFILE,
    })
    type: ImageEnum;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    updatedAt: Date;
}

export class ImagesResponseDto {
    @ApiProperty({
        description: 'Success message',
        example: 'Images retrieved successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Array of images',
        type: [ImageDto],
    })
    data: ImageDto[];
}