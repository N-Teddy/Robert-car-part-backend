import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { Image } from '../../entities/image.entity';
import { CloudinaryService } from './cloudinary.service';
import { LocalStorageService } from './local-storage.service';
import { ImageEnum } from '../../common/enum/entity.enum';
import { User } from 'src/entities/user.entity';
import { Vehicle } from 'src/entities/vehicle.entity';
import { Part } from 'src/entities/part.entity';
export interface UploadResult {
    url: string;
    imageId: string;
    type: ImageEnum;
    entityId?: string;
    entityType?: string;
}
export interface UploadResult {
    url: string;
    imageId: string;
    type: ImageEnum;
    entityId?: string;
    entityType?: string;
}
export interface BulkUploadResult {
    successful: UploadResult[];
    failed: {
        error: string;
        file: Express.Multer.File;
    }[];
}
export interface BulkUpdateResult {
    successful: {
        imageId: string;
        url: string;
    }[];
    failed: {
        imageId: string;
        error: string;
    }[];
}
export declare class UploadService {
    private configService;
    private cloudinaryService;
    private localStorageService;
    private imageRepository;
    private userRepository;
    private vehicleRepository;
    private partRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(configService: ConfigService, cloudinaryService: CloudinaryService, localStorageService: LocalStorageService, imageRepository: Repository<Image>, userRepository: Repository<User>, vehicleRepository: Repository<Vehicle>, partRepository: Repository<Part>, dataSource: DataSource);
    uploadImage(file: Express.Multer.File, imageType: ImageEnum, entityId?: string, entityType?: string): Promise<UploadResult>;
    private setEntityRelationship;
    private handleUserRelationship;
    private handleVehicleRelationship;
    private handlePartRelationship;
    updateImage(imageId: string, file: Express.Multer.File, imageType: ImageEnum): Promise<UploadResult>;
    private convertUrlToLocalPath;
    getImagesByType(type: ImageEnum): Promise<Image[]>;
    getImagesByEntity(entityId: string, entityType: string): Promise<Image[]>;
    getImageStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        typeBreakdown: any;
        storage: string;
    }>;
    uploadMultipleImages(files: Express.Multer.File[], imageType: ImageEnum, entityId?: string, entityType?: string): Promise<BulkUploadResult>;
    updateMultipleImages(updates: Array<{
        imageId: string;
        file: Express.Multer.File;
        imageType: ImageEnum;
    }>): Promise<BulkUpdateResult>;
    replaceEntityImages(files: Express.Multer.File[], imageType: ImageEnum, entityId: string, entityType: string): Promise<BulkUploadResult>;
    deleteAllEntityImages(entityId: string, entityType: string, queryRunner?: any): Promise<void>;
    deleteMultipleImages(imageIds: string[]): Promise<{
        deleted: string[];
        failed: string[];
    }>;
    reorderEntityImages(entityId: string, entityType: string, imageIdsInOrder: string[]): Promise<void>;
    setPrimaryImage(imageId: string, entityId: string, entityType: string): Promise<void>;
    getImageById(imageId: string): Promise<Image>;
    deleteImage(imageId: string, queryRunner?: any): Promise<void>;
}
