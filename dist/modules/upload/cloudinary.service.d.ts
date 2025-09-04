import { ConfigService } from '@nestjs/config';
import { ImageEnum } from '../../common/enum/entity.enum';
export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
}
export declare class CloudinaryService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    private getFolderNameFromImageType;
    uploadImage(file: Express.Multer.File, imageType: ImageEnum): Promise<CloudinaryUploadResult>;
    deleteImage(publicId: string): Promise<void>;
    updateImage(publicId: string, file: Express.Multer.File, imageType: ImageEnum): Promise<CloudinaryUploadResult>;
}
