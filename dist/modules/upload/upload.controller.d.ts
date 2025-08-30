import { UploadService } from './upload.service';
import { ImageEnum } from '../../common/enum/entity.enum';
import { UploadImageDto, BulkUploadDto } from '../../dto/request/upload.dto';
import { UploadResponseDto, BulkUploadResponseDto, UploadStatsResponseDto, ImagesResponseDto } from '../../dto/response/upload.dto';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadImage(file: Express.Multer.File, uploadDto: UploadImageDto): Promise<UploadResponseDto>;
    updateImage(id: string, file: Express.Multer.File, body: {
        folder?: string;
    }): Promise<UploadResponseDto>;
    deleteImage(id: string): Promise<{
        message: string;
    }>;
    uploadMultipleImages(files: Express.Multer.File[], uploadDto: BulkUploadDto): Promise<BulkUploadResponseDto>;
    getUploadStats(): Promise<UploadStatsResponseDto>;
    getImagesByType(type: ImageEnum): Promise<ImagesResponseDto>;
    getImagesByEntity(entityType: string, entityId: string): Promise<ImagesResponseDto>;
}
