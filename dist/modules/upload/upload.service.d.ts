import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Image } from '../../entities/image.entity';
import { CloudinaryService } from './cloudinary.service';
import { LocalStorageService } from './local-storage.service';
import { ImageEnum } from '../../common/enum/entity.enum';
export interface UploadResult {
    url: string;
    imageId: string;
    type: ImageEnum;
    entityId?: string;
    entityType?: string;
}
export declare class UploadService {
    private configService;
    private cloudinaryService;
    private localStorageService;
    private imageRepository;
    private readonly logger;
    constructor(configService: ConfigService, cloudinaryService: CloudinaryService, localStorageService: LocalStorageService, imageRepository: Repository<Image>);
    uploadImage(file: Express.Multer.File, imageType: ImageEnum, entityId?: string, entityType?: string, folder?: string): Promise<UploadResult>;
    deleteImage(imageId: string): Promise<void>;
    updateImage(imageId: string, file: Express.Multer.File, folder?: string): Promise<UploadResult>;
    getImagesByType(type: ImageEnum): Promise<Image[]>;
    getImagesByEntity(entityId: string, entityType: string): Promise<Image[]>;
    getImageStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        typeBreakdown: any;
        storage: string;
    }>;
    private extractPublicIdFromUrl;
    private extractLocalPathFromUrl;
}
