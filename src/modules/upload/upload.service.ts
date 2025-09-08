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
                    const user = await this.userRepository.findOne({ where: { id: entityId } });
                    exists = !!user;
                    break;
                case ImageEnum.VEHICLE:
                    const vehicle = await this.vehicleRepository.findOne({ where: { id: entityId } });
                    exists = !!vehicle;
                    break;
                case ImageEnum.PART:
                    const part = await this.partRepository.findOne({ where: { id: entityId } });
                    exists = !!part;
                    break;
                case ImageEnum.CATEGORY:
                    // Check if category exists and doesn't already have an image
                    const category = await this.categoryRepository.findOne({
                        where: { id: entityId },
                        relations: ['image']
                    });
                    if (!category) {
                        throw new NotFoundException(`Category with ID ${entityId} not found`);
                    }
                    if (category.image) {
                        // Delete the old image before uploading new one
                        await this.deleteImage(category.image.id);
                    }
                    exists = true;
                    break;
                case ImageEnum.QR_CODE:
                    const qrCode = await this.qrCodeRepository.findOne({ where: { id: entityId } });
                    exists = !!qrCode;
                    break;
            }

            if (!exists) {
                throw new NotFoundException(`Entity ${entityType} with ID ${entityId} not found`);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to validate entity: ${entityType} - ${entityId}`, error);
            throw new BadRequestException('Failed to validate entity');
        }
    }

    async uploadSingleImage(
        file: Express.Multer.File,
        entityType: ImageEnum,
        entityId: string,
        userId: string, // This is the ID of the user uploading the image
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

            // Validate entity exists (and handle category special case)
            await this.validateEntity(entityType, entityId);

            // Upload to storage
            const storageService = this.getStorageService();
            const uploadResult = await storageService.uploadFile(file, entityType, entityId);

            // Build the image data object
            const imageData: any = {
                url: uploadResult.url,
                publicId: uploadResult.publicId,
                format: uploadResult.format,
                size: uploadResult.size,
                type: entityType,
                createdBy: userId, // This sets the createdBy field from BaseEntity
            };

            // Add the appropriate relationship based on entity type
            switch (entityType) {
                case ImageEnum.USER_PROFILE:
                    imageData.user = { id: entityId };
                    break;
                case ImageEnum.VEHICLE:
                    imageData.vehicle = { id: entityId };
                    break;
                case ImageEnum.PART:
                    imageData.part = { id: entityId };
                    break;
                case ImageEnum.CATEGORY:
                    imageData.category = { id: entityId };
                    break;
                case ImageEnum.QR_CODE:
                    imageData.qrCode = { id: entityId };
                    break;
            }

            // Create and save the image
            const image = this.imageRepository.create(imageData);
            const savedImage = await this.imageRepository.save(image);

            // Load with relations for response
            const imageWithRelations = await this.imageRepository.findOne({
                where: { id: savedImage.id },
                relations: ['user', 'vehicle', 'part', 'category', 'qrCode'],
            });

            if (!imageWithRelations) {
                throw new Error('Failed to load saved image');
            }

            // Get the user who uploaded for response
            const uploader = await this.userRepository.findOne({
                where: { id: userId },
                select: ['id', 'name', 'email']
            });

            return this.mapToResponseDto(imageWithRelations, uploader);
        } catch (error) {
            this.logger.error('Failed to upload single image', error);
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to upload image');
        }
    }

    async uploadMultipleImages(
        files: Express.Multer.File[],
        entityType: ImageEnum,
        entityId: string,
        userId: string, // User ID for createdBy field
    ): Promise<MultipleUploadResponseDto> {
        // Categories can only have one image, so prevent multiple uploads
        if (entityType === ImageEnum.CATEGORY && files.length > 1) {
            throw new BadRequestException('Categories can only have one image');
        }

        try {
            // Validate files
            if (!files || files.length === 0) {
                throw new BadRequestException('No files provided');
            }

            // Validate entity exists once
            await this.validateEntity(entityType, entityId);

            const uploadedImages: UploadedImageResponseDto[] = [];
            const failedUploads: string[] = [];
            let totalSize = 0;

            // Upload each file
            for (const file of files) {
                try {
                    const uploadedImage = await this.uploadSingleImage(file, entityType, entityId, userId);
                    uploadedImages.push(uploadedImage);
                    totalSize += uploadedImage.size;
                } catch (error) {
                    this.logger.error(`Failed to upload file: ${file.originalname}`, error);
                    failedUploads.push(file.originalname);
                }
            }

            if (uploadedImages.length === 0) {
                throw new BadRequestException('All file uploads failed');
            }

            const response: MultipleUploadResponseDto = {
                images: uploadedImages,
                count: uploadedImages.length,
                totalSize,
            };

            // Add failed uploads info if any
            if (failedUploads.length > 0) {
                this.logger.warn(`Failed to upload ${failedUploads.length} files: ${failedUploads.join(', ')}`);
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to upload multiple images', error);
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to upload images');
        }
    }

    async getImageById(id: string): Promise<UploadedImageResponseDto> {
        try {
            const image = await this.imageRepository.findOne({
                where: { id },
                relations: ['user', 'vehicle', 'part', 'category', 'qrCode'],
            });

            if (!image) {
                throw new NotFoundException(`Image with ID ${id} not found`);
            }

            // Get the uploader info from createdBy field
            let uploader = null;
            if (image.createdBy) {
                uploader = await this.userRepository.findOne({
                    where: { id: image.createdBy },
                    select: ['id', 'name', 'email']
                });
            }

            return this.mapToResponseDto(image, uploader);
        } catch (error) {
            this.logger.error(`Failed to get image by ID: ${id}`, error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to retrieve image');
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
            await storageService.deleteFile(image.publicId);

            // Delete from database
            await this.imageRepository.remove(image);

            this.logger.log(`Image ${id} deleted successfully`);
        } catch (error) {
            this.logger.error(`Failed to delete image: ${id}`, error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to delete image');
        }
    }

    async getImagesByEntity(entityType: ImageEnum, entityId: string): Promise<UploadedImageResponseDto[]> {
        try {
            // Build where clause based on entity type
            const whereClause: any = { type: entityType };

            switch (entityType) {
                case ImageEnum.USER_PROFILE:
                    whereClause.user = { id: entityId };
                    break;
                case ImageEnum.VEHICLE:
                    whereClause.vehicle = { id: entityId };
                    break;
                case ImageEnum.PART:
                    whereClause.part = { id: entityId };
                    break;
                case ImageEnum.CATEGORY:
                    whereClause.category = { id: entityId };
                    break;
                case ImageEnum.QR_CODE:
                    whereClause.qrCode = { id: entityId };
                    break;
            }

            const images = await this.imageRepository.find({
                where: whereClause,
                relations: ['user', 'vehicle', 'part', 'category', 'qrCode'],
                order: { createdAt: 'DESC' },
            });

            const responseDtos: UploadedImageResponseDto[] = [];

            for (const image of images) {
                let uploader = null;
                if (image.createdBy) {
                    uploader = await this.userRepository.findOne({
                        where: { id: image.createdBy },
                        select: ['id', 'name', 'email']
                    });
                }
                responseDtos.push(this.mapToResponseDto(image, uploader));
            }

            return responseDtos;
        } catch (error) {
            this.logger.error(`Failed to get images for entity: ${entityType} - ${entityId}`, error);
            throw new BadRequestException('Failed to retrieve images');
        }
    }

    private mapToResponseDto(image: Image, uploader?: User | null): UploadedImageResponseDto {
        return {
            id: image.id,
            url: image.url,
            publicId: image.publicId,
            format: image.format,
            size: image.size,
            entityType: image.type,
            entityId: this.getEntityIdFromImage(image),
            uploadedBy: uploader ? {
                id: uploader.id,
                name: uploader.name,
            } : undefined,
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
