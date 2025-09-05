import { UploadService } from './upload.service';
import { UploadImageDto, UploadMultipleImagesDto } from '../../dto/request/upload.dto';
import { UploadedImageResponseDto, MultipleUploadResponseDto } from '../../dto/response/upload.dto';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadSingle(file: Express.Multer.File, uploadDto: UploadImageDto, req: any): Promise<UploadedImageResponseDto>;
    uploadMultiple(files: Express.Multer.File[], uploadDto: UploadMultipleImagesDto, req: any): Promise<MultipleUploadResponseDto>;
    getImage(id: string): Promise<UploadedImageResponseDto>;
    deleteImage(id: string): Promise<void>;
}
