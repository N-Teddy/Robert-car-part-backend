import { ImageEnum } from '../../common/enum/entity.enum';
export declare class UploadImageDto {
    type: ImageEnum;
    entityId?: string;
    entityType?: string;
    folder?: string;
}
export declare class UpdateImageDto {
    folder?: string;
}
export declare class BulkUploadDto {
    type: ImageEnum;
    entityId?: string;
    entityType?: string;
    folder?: string;
}
