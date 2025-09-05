import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Image } from '../../entities/image.entity';
import { User } from '../../entities/user.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Part } from '../../entities/part.entity';
import { Category } from '../../entities/category.entity';
import { QrCode } from '../../entities/qr-code.entity';
import { LocalStorageService } from './local-storage.service';
import { CloudinaryService } from './cloudinary.service';
import { ImageEnum } from '../../common/enum/entity.enum';
import { UploadedImageResponseDto, MultipleUploadResponseDto } from '../../dto/response/upload.dto';

@Injectable()
export class UploadService {
    private readonly logger = new Logger(UploadService.name);
    private readonly isProduction: boolean;

    constructor(
        @InjectRepository(Image)
        private readonly imageRepository: Repository<Image>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Vehicle)
        private readonly vehicleRepository: Repository<Vehicle>,
        @InjectRepository(Part)
        private readonly partRepository: Repository<Part>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(QrCode)
        private readonly qrCodeRepository: Repository<QrCode>,
        private readonly localStorageService: LocalStorageService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly configService: ConfigService,
    ) {
        this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    }

    private getStorageService() {
        return this.isProduction ? this.cloudinaryService : this.localStorageService;
    }

    private async validateEntity(entityType: ImageEnum, entityId: string): Promise<void> {
        let exists = false;

        try {
            switch (entityType) {
                case ImageEnum.USER_PROFILE:
                    exists = await this.userRepository.exist({ where: { id: entityId } });
                    break;
                case ImageEnum.VEHICLE:
                    exists = await this.vehicleRepository.exist({ where: { id: entityId } });
                    break;
                case ImageEnum.PART:
                    exists = await this.partRepository.exist({ where: { id: entityId } });
                    break;
                case ImageEnum.CATEGORY:
                    exists = await this.categoryRepository.exist({ where: { id: entityId } });
                    break;
                case ImageEnum.QR_CODE:
                    exists = await this.qrCodeRepository.exist({ where: { id: entityId } });
                    break;
            }

            if (!exists) {
                throw new NotFoundException(`Entity ${entityType} with ID ${entityId} not found`);
            }
        } catch (error) {
            this.logger.error(`Failed to validate entity: ${entityType} - ${entityId}`, error);
            throw error;
        }
    }

    private async getEntityRelation(entityType: ImageEnum, entityId: string): Promise<any> {
        const relations: any = {};

        switch (entityType) {
            case ImageEnum.USER_PROFILE:
                relations.user = { id: entityId };
                break;
            case ImageEnum.VEHICLE:
                relations.vehicle = { id: entityId };
                break;
            case ImageEnum.PART:
                relations.part = { id: entityId };
                break;
            case ImageEnum.CATEGORY:
                relations.category = { id: entityId };
                break;
            case ImageEnum.QR_CODE:
                relations.qrCode = { id: entityId };
                break;
        }

        return relations;
    }

    async uploadSingleImage(
        file: Express.Multer.File,
        entityType: ImageEnum,
        entityId: string,
        createdBy: string,
    ): Promise<UploadedImageResponseDto> {
        try {
            // Validate file
            if (!file) {
                throw new BadRequestException('No file provided');
            }

            // Validate file size
            const maxSize = this.configService.get<number>('MAX_FILE_SIZE') || 10485760; // 10MB default
            if (file.size > maxSize) {
                throw new BadRequestException(`File size exceeds maximum allowed size of ${maxSize} bytes`);
            }

            // Validate file type
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
            }

            // Validate entity exists
            await this.validateEntity(entityType, entityId);

            // Upload to storage
            const storageService = this.getStorageService();
            const uploadResult = await storageService.uploadFile(file, entityType, entityId);

            // Get entity relations
            const entityRelations = await this.getEntityRelation(entityType, entityId);

            // Create base image object
            const imageData = {
                url: uploadResult.url,
                publicId: uploadResult.publicId,
                format: uploadResult.format,
                size: uploadResult.size,
                type: entityType,
                createdBy: { id: createdBy },
            };

            // Use Object.assign to merge the relations
            const image = this.imageRepository.create(
                Object.assign({}, imageData, entityRelations)
            );

            const savedImage = await this.imageRepository.save(image);

            // Load with relations for response
            const imageWithRelations = await this.imageRepository.findOne({
                where: { id: savedImage.id },
                relations: ['createdBy'],
            });

            return this.mapToResponseDto(imageWithRelations!);
        } catch (error) {
            this.logger.error('Failed to upload single image', error);
            throw error;
        }
    }

    async uploadMultipleImages(
        files: Express.Multer.File[],
        entityType: ImageEnum,
        entityId: string,
        uploadedBy: string,
    ): Promise<MultipleUploadResponseDto> {
        try {
            // Validate files
            if (!files || files.length === 0) {
                throw new BadRequestException('No files provided');
            }

            // Validate entity exists once
            await this.validateEntity(entityType, entityId);

            const uploadedImages: UploadedImageResponseDto[] = [];
            let totalSize = 0;

            // Upload each file
            for (const file of files) {
                const uploadedImage = await this.uploadSingleImage(file, entityType, entityId, uploadedBy);
                uploadedImages.push(uploadedImage);
                totalSize += uploadedImage.size;
            }

            return {
                images: uploadedImages,
                count: uploadedImages.length,
                totalSize,
            };
        } catch (error) {
            this.logger.error('Failed to upload multiple images', error);
            throw error;
        }
    }

    async getImageById(id: string): Promise<UploadedImageResponseDto> {
        try {
            const image = await this.imageRepository.findOne({
                where: { id },
                relations: ['createdBy', 'user', 'vehicle', 'part', 'category', 'qrCode'],
            });

            if (!image) {
                throw new NotFoundException(`Image with ID ${id} not found`);
            }

            return this.mapToResponseDto(image);
        } catch (error) {
            this.logger.error(`Failed to get image by ID: ${id}`, error);
            throw error;
        }
    }

    async deleteImage(id: string): Promise<void> {
        try {
            const image = await this.imageRepository.findOne({ where: { id } });

            if (!image) {
                throw new NotFoundException(`Image with ID ${id} not found`);
            }

            // Delete from storage
            const storageService = this.getStorageService();
            await storageService.deleteFile(image.id);

            // Delete from database
            await this.imageRepository.remove(image);

            this.logger.log(`Image ${id} deleted successfully`);
        } catch (error) {
            this.logger.error(`Failed to delete image: ${id}`, error);
            throw error;
        }
    }

    private mapToResponseDto(image: Image): UploadedImageResponseDto {
        return {
            id: image.id,
            url: image.url,
            entityType: image.type,
            entityId: this.getEntityIdFromImage(image),
            // uploadedBy: image.createdBy ? {
                // id: image.createdBy.id,
                // name: image.createdBy.name,
            // } : undefined,
            createdAt: image.createdAt,
            updatedAt: image.updatedAt,
        };
    }

    private getEntityIdFromImage(image: Image): string {
        if (image.user) return image.user.id;
        if (image.vehicle) return image.vehicle.id;
        if (image.part) return image.part.id;
        if (image.category) return image.category.id;
        if (image.qrCode) return image.qrCode.id;
        return '';
    }
}
