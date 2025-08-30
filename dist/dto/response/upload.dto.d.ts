import { ImageEnum } from '../../common/enum/entity.enum';
export declare class UploadResultDto {
    url: string;
    imageId: string;
    type: ImageEnum;
    entityId?: string;
    entityType?: string;
}
export declare class UploadResponseDto {
    message: string;
    data: UploadResultDto;
}
export declare class BulkUploadResultDto {
    data?: UploadResultDto;
    error?: string;
    filename?: string;
}
export declare class BulkUploadResponseDto {
    message: string;
    data: BulkUploadResultDto[];
}
export declare class UploadStatsDto {
    totalFiles: number;
    totalSize: number;
    typeBreakdown: Record<string, number>;
    storage: string;
}
export declare class UploadStatsResponseDto {
    message: string;
    data: UploadStatsDto;
}
export declare class ImageDto {
    id: string;
    url: string;
    type: ImageEnum;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ImagesResponseDto {
    message: string;
    data: ImageDto[];
}
