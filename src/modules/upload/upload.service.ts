import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class UploadService {
	private readonly logger = new Logger(UploadService.name);

	constructor(
		private configService: ConfigService,
		private cloudinaryService: CloudinaryService,
		private localStorageService: LocalStorageService,
		@InjectRepository(Image)
		private imageRepository: Repository<Image>
	) {}

	async uploadImage(
		file: Express.Multer.File,
		imageType: ImageEnum,
		entityId?: string,
		entityType?: string,
		folder?: string
	): Promise<UploadResult> {
		try {
			const isProduction =
				this.configService.get('app.environment') === 'production';

			let uploadResult: {
				url: string;
				publicId?: string;
				localPath?: string;
			};

			if (isProduction) {
				// Upload to Cloudinary
				uploadResult = await this.cloudinaryService.uploadImage(
					file,
					imageType,
					folder
				);
			} else {
				// Store locally
				uploadResult = await this.localStorageService.uploadImage(
					file,
					imageType,
					folder
				);
			}

			// Save image record to database
			const image = this.imageRepository.create({
				url: uploadResult.url,
				type: imageType,
			});

			// Set entity relationships based on type
			if (entityId && entityType) {
				switch (entityType) {
					case 'user':
						image.user = { id: entityId } as any;
						break;
					case 'vehicle':
						image.vehicle = { id: entityId } as any;
						break;
					case 'part':
						image.part = { id: entityId } as any;
						break;
				}
			}

			const savedImage = await this.imageRepository.save(image);

			this.logger.log(`Image uploaded successfully: ${savedImage.id}`);

			return {
				url: uploadResult.url,
				imageId: savedImage.id,
				type: imageType,
				entityId,
				entityType,
			};
		} catch (error) {
			this.logger.error(`Failed to upload image: ${error.message}`);
			throw new BadRequestException(
				`Failed to upload image: ${error.message}`
			);
		}
	}

	async deleteImage(imageId: string): Promise<void> {
		try {
			const image = await this.imageRepository.findOne({
				where: { id: imageId },
			});
			if (!image) {
				throw new BadRequestException('Image not found');
			}

			const isProduction =
				this.configService.get('app.environment') === 'production';

			if (isProduction) {
				// Extract public ID from Cloudinary URL
				const publicId = this.extractPublicIdFromUrl(image.url);
				if (publicId) {
					await this.cloudinaryService.deleteImage(publicId);
				}
			} else {
				// Extract local path from URL
				const localPath = this.extractLocalPathFromUrl(image.url);
				if (localPath) {
					await this.localStorageService.deleteImage(localPath);
				}
			}

			// Delete from database
			await this.imageRepository.remove(image);

			this.logger.log(`Image deleted successfully: ${imageId}`);
		} catch (error) {
			this.logger.error(`Failed to delete image: ${error.message}`);
			throw new BadRequestException(
				`Failed to delete image: ${error.message}`
			);
		}
	}

	async updateImage(
		imageId: string,
		file: Express.Multer.File,
		folder?: string
	): Promise<UploadResult> {
		try {
			const image = await this.imageRepository.findOne({
				where: { id: imageId },
			});
			if (!image) {
				throw new BadRequestException('Image not found');
			}

			const isProduction =
				this.configService.get('app.environment') === 'production';

			let uploadResult: {
				url: string;
				publicId?: string;
				localPath?: string;
			};

			if (isProduction) {
				// Update in Cloudinary
				const publicId = this.extractPublicIdFromUrl(image.url);
				if (publicId) {
					uploadResult = await this.cloudinaryService.updateImage(
						publicId,
						file
					);
				} else {
					// Fallback to new upload if public ID can't be extracted
					uploadResult = await this.cloudinaryService.uploadImage(
						file,
						image.type,
						folder
					);
				}
			} else {
				// Update locally
				const localPath = this.extractLocalPathFromUrl(image.url);
				if (localPath) {
					uploadResult = await this.localStorageService.updateImage(
						localPath,
						file,
						image.type,
						folder
					);
				} else {
					// Fallback to new upload if local path can't be extracted
					uploadResult = await this.localStorageService.uploadImage(
						file,
						image.type,
						folder
					);
				}
			}

			// Update image record
			image.url = uploadResult.url;
			const updatedImage = await this.imageRepository.save(image);

			this.logger.log(`Image updated successfully: ${imageId}`);

			return {
				url: uploadResult.url,
				imageId: updatedImage.id,
				type: updatedImage.type,
			};
		} catch (error) {
			this.logger.error(`Failed to update image: ${error.message}`);
			throw new BadRequestException(
				`Failed to update image: ${error.message}`
			);
		}
	}

	async getImagesByType(type: ImageEnum): Promise<Image[]> {
		return this.imageRepository.find({ where: { type } });
	}

	async getImagesByEntity(
		entityId: string,
		entityType: string
	): Promise<Image[]> {
		const whereClause: any = {};

		switch (entityType) {
			case 'user':
				whereClause.user = { id: entityId };
				break;
			case 'vehicle':
				whereClause.vehicle = { id: entityId };
				break;
			case 'part':
				whereClause.part = { id: entityId };
				break;
			default:
				throw new BadRequestException('Invalid entity type');
		}

		return this.imageRepository.find({ where: whereClause });
	}

	async getImageStats() {
		const isProduction =
			this.configService.get('app.environment') === 'production';

		if (isProduction) {
			// For production, return basic stats from database
			const totalImages = await this.imageRepository.count();
			const typeBreakdown = await this.imageRepository
				.createQueryBuilder('image')
				.select('image.type', 'type')
				.addSelect('COUNT(*)', 'count')
				.groupBy('image.type')
				.getRawMany();

			return {
				totalFiles: totalImages,
				totalSize: 0, // Cloudinary doesn't provide easy size info
				typeBreakdown: typeBreakdown.reduce((acc, item) => {
					acc[item.type] = parseInt(item.count);
					return acc;
				}, {}),
				storage: 'cloudinary',
			};
		} else {
			// For development, get detailed local stats
			const stats = await this.localStorageService.getImageStats();
			return {
				...stats,
				storage: 'local',
			};
		}
	}

	private extractPublicIdFromUrl(url: string): string | null {
		try {
			// Extract public ID from Cloudinary URL
			const match = url.match(/\/v\d+\/([^\/]+)\./);
			return match ? match[1] : null;
		} catch {
			return null;
		}
	}

	private extractLocalPathFromUrl(url: string): string | null {
		try {
			// Extract local path from URL
			const match = url.match(/\/uploads\/(.+)/);
			return match ? `./uploads/${match[1]}` : null;
		} catch {
			return null;
		}
	}
}
