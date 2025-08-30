import { ConfigService } from '@nestjs/config';
import { ImageEnum } from '../../common/enum/entity.enum';
export declare class CloudinaryService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File, imageType: ImageEnum, folder?: string): Promise<{
        url: string;
        publicId: string;
    }>;
    deleteImage(publicId: string): Promise<void>;
    updateImage(publicId: string, file: Express.Multer.File): Promise<{
        url: string;
        publicId: string;
    }>;
}
