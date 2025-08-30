import { ConfigService } from '@nestjs/config';
import { ImageEnum } from '../../common/enum/entity.enum';
export declare class LocalStorageService {
    private configService;
    private readonly logger;
    private readonly uploadsDir;
    constructor(configService: ConfigService);
    private ensureUploadsDirectory;
    uploadImage(file: Express.Multer.File, imageType: ImageEnum, folder?: string): Promise<{
        url: string;
        localPath: string;
    }>;
    deleteImage(localPath: string): Promise<void>;
    updateImage(oldLocalPath: string, file: Express.Multer.File, imageType: ImageEnum, folder?: string): Promise<{
        url: string;
        localPath: string;
    }>;
    private getFileExtension;
    getImageStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        typeBreakdown: Record<string, number>;
    }>;
    private getDirectoryStats;
}
