import { ConfigService } from '@nestjs/config';
import { ImageEnum } from '../../common/enum/entity.enum';
export interface ImageUploadResult {
    url: string;
    localPath: string;
    filename: string;
}
export declare class LocalStorageService {
    private configService;
    private readonly logger;
    private readonly uploadsDir;
    constructor(configService: ConfigService);
    private ensureUploadsDirectory;
    private getFolderNameFromImageType;
    private generateFileName;
    uploadImage(file: Express.Multer.File, imageType: ImageEnum): Promise<ImageUploadResult>;
    deleteImage(localPath: string): Promise<void>;
    updateImage(oldLocalPath: string, file: Express.Multer.File, imageType: ImageEnum): Promise<ImageUploadResult>;
    private getFileExtension;
    getPublicUrl(localPath: string): string;
    getImageStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        typeBreakdown: Record<string, number>;
    }>;
    private getDirectoryStats;
}
