import { ImageEnum } from '../../common/enum/entity.enum';
export declare class UploadedImageResponseDto {
    id: string;
    url: string;
    publicId: string;
    format: string;
    size: number;
    entityType: ImageEnum;
    entityId: string;
    uploadedBy?: {
        id: string;
        name: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare class MultipleUploadResponseDto {
    images: UploadedImageResponseDto[];
    count: number;
    totalSize: number;
}
