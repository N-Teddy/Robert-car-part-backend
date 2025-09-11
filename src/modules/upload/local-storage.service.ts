import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { ImageEnum } from '../../common/enum/entity.enum';

const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

@Injectable()
export class LocalStorageService {
	private readonly logger = new Logger(LocalStorageService.name);
	private readonly uploadPath: string;
	private readonly baseUrl: string;

	constructor(private configService: ConfigService) {
		this.uploadPath = path.join(process.cwd(), 'uploads');
		this.baseUrl =
			this.configService.get<string>('APP_URL') ||
			'http://localhost:3000';
		this.ensureUploadDirectories();
	}

	private async ensureUploadDirectories(): Promise<void> {
		try {
			// Create main upload directory if it doesn't exist
			if (!fs.existsSync(this.uploadPath)) {
				await mkdirAsync(this.uploadPath, { recursive: true });
			}

			// Create subdirectories for each entity type
			for (const entityType of Object.values(ImageEnum)) {
				const subfolderPath = path.join(
					this.uploadPath,
					entityType.toLowerCase()
				);
				if (!fs.existsSync(subfolderPath)) {
					await mkdirAsync(subfolderPath, { recursive: true });
				}
			}
		} catch (error) {
			this.logger.error('Failed to create upload directories', error);
		}
	}

	async uploadFile(
		file: Express.Multer.File,
		entityType: ImageEnum,
		entityId: string
	): Promise<{
		url: string;
		publicId: string;
		format: string;
		size: number;
	}> {
		try {
			const fileExtension = path.extname(file.originalname);
			const fileName = `${entityType}-${entityId}-${Date.now()}${fileExtension}`;
			const subfolder = entityType.toLowerCase();
			const filePath = path.join(this.uploadPath, subfolder, fileName);

			// Write file to disk
			await fs.promises.writeFile(filePath, file.buffer);

			const url = `${this.baseUrl}/uploads/${subfolder}/${fileName}`;

			this.logger.log(`File uploaded locally: ${url}`);

			return {
				url,
				publicId: `${subfolder}/${fileName}`,
				format: fileExtension.replace('.', ''),
				size: file.size,
			};
		} catch (error) {
			this.logger.error('Failed to upload file locally', error);
			throw error;
		}
	}

	async deleteFile(publicId: string): Promise<void> {
		try {
			const filePath = path.join(this.uploadPath, publicId);

			if (fs.existsSync(filePath)) {
				await unlinkAsync(filePath);
				this.logger.log(`File deleted locally: ${publicId}`);
			} else {
				this.logger.warn(`File not found for deletion: ${publicId}`);
			}
		} catch (error) {
			this.logger.error('Failed to delete file locally', error);
			throw error;
		}
	}
}
