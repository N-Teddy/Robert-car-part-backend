import { ConfigService } from '@nestjs/config';
import { ImageEnum } from '../../common/enum/entity.enum';
export declare class LocalStorageService {
    private configService;
    private readonly logger;
    private readonly uploadPath;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    private ensureUploadDirectories;
    uploadFile(file: Express.Multer.File, entityType: ImageEnum, entityId: string): Promise<{
        url: string;
        publicId: string;
        format: string;
        size: number;
    }>;
    deleteFile(publicId: string): Promise<void>;
}
