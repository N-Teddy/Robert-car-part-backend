import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ImageEnum } from '../../common/enum/entity.enum';

@Injectable()
export class LocalStorageService {
	private readonly logger = new Logger(LocalStorageService.name);
	private readonly uploadsDir = './uploads';

	constructor(private configService: ConfigService) {
		this.ensureUploadsDirectory();
	}

	private async ensureUploadsDirectory(): Promise<void> {
		try {
			await fs.access(this.uploadsDir);
		} catch {
			await fs.mkdir(this.uploadsDir, { recursive: true });
			this.logger.log('Created uploads directory');
		}
	}

	async uploadImage(
		file: Express.Multer.File,
		imageType: ImageEnum,
		folder?: string
	): Promise<{ url: string; localPath: string }> {
		try {
			// Ensure the specific type directory exists
			const typeDir = join(
				this.uploadsDir,
				imageType.toLowerCase().replace(' ', '-')
			);
			await fs.mkdir(typeDir, { recursive: true });

			// Create subfolder if specified
			let finalDir = typeDir;
			if (folder) {
				finalDir = join(typeDir, folder);
				await fs.mkdir(finalDir, { recursive: true });
			}

			// Generate file path - use the filename from Multer if available
			const fileName =
				file.filename ||
				`${Date.now()}-${Math.random().toString(36).substring(7)}${this.getFileExtension(file.originalname)}`;
			const filePath = join(finalDir, fileName);

			// Check if file was stored by diskStorage (has path) or memory (has buffer)
			if (file.path) {
				// File was stored by diskStorage, move it to the organized location
				await fs.copyFile(file.path, filePath);
				// Clean up the temp file
				await fs.unlink(file.path);
			} else if (file.buffer) {
				// File was stored in memory, write it to disk
				await fs.writeFile(filePath, file.buffer);
			} else {
				throw new Error('File has neither path nor buffer');
			}

			// Generate URL for local access
			const baseUrl =
				this.configService.get('app.baseUrl') ||
				'http://localhost:3000';
			const url = `${baseUrl}/uploads/${imageType.toLowerCase().replace(' ', '-')}/${folder ? folder + '/' : ''}${fileName}`;

			this.logger.log(`Image stored locally: ${filePath}`);

			return {
				url,
				localPath: filePath,
			};
		} catch (error) {
			this.logger.error(
				`Failed to store image locally: ${error.message}`
			);
			throw new Error(`Failed to store image: ${error.message}`);
		}
	}

	async deleteImage(localPath: string): Promise<void> {
		try {
			await fs.unlink(localPath);
			this.logger.log(`Image deleted locally: ${localPath}`);
		} catch (error) {
			this.logger.error(`Failed to delete local image: ${error.message}`);
			throw new Error(`Failed to delete image: ${error.message}`);
		}
	}

	async updateImage(
		oldLocalPath: string,
		file: Express.Multer.File,
		imageType: ImageEnum,
		folder?: string
	): Promise<{ url: string; localPath: string }> {
		try {
			// Delete old image
			await this.deleteImage(oldLocalPath);

			// Upload new image
			const result = await this.uploadImage(file, imageType, folder);

			return result;
		} catch (error) {
			this.logger.error(`Failed to update local image: ${error.message}`);
			throw new Error(`Failed to update image: ${error.message}`);
		}
	}

	private getFileExtension(filename: string): string {
		const ext = filename.split('.').pop();
		return ext ? `.${ext}` : '';
	}

	async getImageStats(): Promise<{
		totalFiles: number;
		totalSize: number;
		typeBreakdown: Record<string, number>;
	}> {
		try {
			const stats = await this.getDirectoryStats(this.uploadsDir);
			return stats;
		} catch (error) {
			this.logger.error(`Failed to get image stats: ${error.message}`);
			return { totalFiles: 0, totalSize: 0, typeBreakdown: {} };
		}
	}

	private async getDirectoryStats(dirPath: string): Promise<{
		totalFiles: number;
		totalSize: number;
		typeBreakdown: Record<string, number>;
	}> {
		let totalFiles = 0;
		let totalSize = 0;
		const typeBreakdown: Record<string, number> = {};

		try {
			const items = await fs.readdir(dirPath, { withFileTypes: true });

			for (const item of items) {
				const fullPath = join(dirPath, item.name);

				if (item.isDirectory()) {
					const subStats = await this.getDirectoryStats(fullPath);
					totalFiles += subStats.totalFiles;
					totalSize += subStats.totalSize;

					// Add to type breakdown
					const typeName = item.name;
					typeBreakdown[typeName] =
						(typeBreakdown[typeName] || 0) + subStats.totalFiles;
				} else if (item.isFile()) {
					totalFiles++;
					const fileStats = await fs.stat(fullPath);
					totalSize += fileStats.size;
				}
			}
		} catch (error) {
			// Directory might not exist yet
			this.logger.debug(
				`Directory ${dirPath} not accessible: ${error.message}`
			);
		}

		return { totalFiles, totalSize, typeBreakdown };
	}
}
