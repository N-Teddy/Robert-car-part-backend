import { ImageEnum } from '../../common/enum/entity.enum';
export declare class UploadedImageResponseDto {
    id: string;
    url: string;
    size?: number;
    entityType: ImageEnum;
    entityId: string;
    createdBy?: {
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
