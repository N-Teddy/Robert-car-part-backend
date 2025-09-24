import { ImageEnum } from '../../common/enum/entity.enum';
export declare class UploadImageDto {
    entityType: ImageEnum;
    entityId: string;
    metadata?: Record<string, any>;
}
export declare class UploadMultipleImagesDto {
    entityType: ImageEnum;
    entityId: string;
    metadata?: Record<string, any>;
}
export declare class DeleteImageDto {
    imageId: string;
}
