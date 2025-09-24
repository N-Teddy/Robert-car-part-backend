import { ConfigService } from '@nestjs/config';
import { ImageEnum } from '../../common/enum/entity.enum';
export declare class CloudinaryService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, entityType: ImageEnum, entityId: string): Promise<{
        url: string;
        publicId: string;
        format: string;
        size: number;
    }>;
    deleteFile(publicId: string): Promise<void>;
}
