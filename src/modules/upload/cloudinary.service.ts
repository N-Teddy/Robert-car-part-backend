import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { ImageEnum } from '../../common/enum/entity.enum';

@Injectable()
export class CloudinaryService {
	private readonly logger = new Logger(CloudinaryService.name);

	constructor(private configService: ConfigService) {
		// Configure Cloudinary
		cloudinary.config({
			cloud_name: this.configService.get('cloudinary.cloudName'),
			api_key: this.configService.get('cloudinary.apiKey'),
			api_secret: this.configService.get('cloudinary.apiSecret'),
		});
	}

	async uploadImage(
		file: Express.Multer.File,
		imageType: ImageEnum,
		folder?: string
	): Promise<{ url: string; publicId: string }> {
		try {
			// Convert buffer to base64
			const base64Image = file.buffer.toString('base64');
			const dataURI = `data:${file.mimetype};base64,${base64Image}`;

			// Determine folder structure based on image type
			let uploadFolder = 'car-parts-shop';
			if (folder) {
				uploadFolder = `${uploadFolder}/${folder}`;
			}

			// Add image type to folder structure
			uploadFolder = `${uploadFolder}/${imageType.toLowerCase().replace(' ', '-')}`;

			const result = await cloudinary.uploader.upload(dataURI, {
				folder: uploadFolder,
				resource_type: 'image',
				allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
				transformation: [
					{ quality: 'auto:good' }, // Optimize quality
					{ fetch_format: 'auto' }, // Auto-format based on browser support
				],
			});

			this.logger.log(
				`Image uploaded to Cloudinary: ${result.public_id}`
			);

			return {
				url: result.secure_url,
				publicId: result.public_id,
			};
		} catch (error) {
			this.logger.error(
				`Failed to upload image to Cloudinary: ${error.message}`
			);
			throw new Error(`Failed to upload image: ${error.message}`);
		}
	}

	async deleteImage(publicId: string): Promise<void> {
		try {
			await cloudinary.uploader.destroy(publicId);
			this.logger.log(`Image deleted from Cloudinary: ${publicId}`);
		} catch (error) {
			this.logger.error(
				`Failed to delete image from Cloudinary: ${error.message}`
			);
			throw new Error(`Failed to delete image: ${error.message}`);
		}
	}

	async updateImage(
		publicId: string,
		file: Express.Multer.File
	): Promise<{ url: string; publicId: string }> {
		try {
			// Delete old image
			await this.deleteImage(publicId);

			// Upload new image
			const result = await this.uploadImage(file, ImageEnum.USER_PROFILE);

			return result;
		} catch (error) {
			this.logger.error(
				`Failed to update image in Cloudinary: ${error.message}`
			);
			throw new Error(`Failed to update image: ${error.message}`);
		}
	}
}
