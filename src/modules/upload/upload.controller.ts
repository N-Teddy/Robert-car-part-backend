import {
	Controller,
	Post,
	Put,
	Delete,
	Get,
	Param,
	UseInterceptors,
	UploadedFile,
	UploadedFiles,
	Body,
	UseGuards,
	Request,
	BadRequestException,
	ParseFilePipe,
	MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
	ApiTags,
	ApiConsumes,
	ApiBody,
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UploadService } from './upload.service';
import { ImageEnum } from '../../common/enum/entity.enum';
import { UserRoleEnum } from '../../common/enum/entity.enum';
import {
	UploadImageDto,
	UpdateImageDto,
	BulkUploadDto,
} from '../../dto/request/upload.dto';
import {
	UploadResponseDto,
	BulkUploadResponseDto,
	UploadStatsResponseDto,
	ImagesResponseDto,
} from '../../dto/response/upload.dto';

// Custom validator for image MIME types
const validateImageMimeType = (file: Express.Multer.File) => {
	const allowedMimeTypes = [
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/gif',
		'image/webp',
	];
	if (!allowedMimeTypes.includes(file.mimetype)) {
		throw new BadRequestException(
			`File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`
		);
	}
	return true;
};

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UploadController {
	constructor(private readonly uploadService: UploadService) {}

	@Post('image')
	@UseInterceptors(FileInterceptor('file'))
	@ApiOperation({
		summary: 'Upload a new image',
		description:
			'Upload a single image file with metadata. File must be under 5MB and in supported image format (jpg, jpeg, png, gif, webp).',
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['file', 'type'],
			properties: {
				file: {
					type: 'string',
					format: 'binary',
					description: 'Image file to upload (max 5MB)',
				},
				type: {
					type: 'string',
					enum: Object.values(ImageEnum),
					description: 'Type of image being uploaded',
					example: ImageEnum.USER_PROFILE,
				},
				entityId: {
					type: 'string',
					format: 'uuid',
					description:
						'ID of the entity this image belongs to (optional)',
					example: '123e4567-e89b-12d3-a456-426614174000',
				},
				entityType: {
					type: 'string',
					enum: ['user', 'vehicle', 'part'],
					description:
						'Type of entity this image belongs to (optional)',
					example: 'user',
				},
				folder: {
					type: 'string',
					description: 'Subfolder for organizing images (optional)',
					example: 'profile-photos',
				},
			},
		},
	})
	@ApiResponse({
		status: 201,
		description: 'Image uploaded successfully',
		type: UploadResponseDto,
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async uploadImage(
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
				],
			})
		)
		file: Express.Multer.File,
		@Body() uploadDto: UploadImageDto
	): Promise<UploadResponseDto> {
		if (!file) {
			throw new BadRequestException('No file uploaded');
		}

		// Validate MIME type
		validateImageMimeType(file);

		if (!uploadDto.type) {
			throw new BadRequestException('Image type is required');
		}

		// Validate image type enum
		if (!Object.values(ImageEnum).includes(uploadDto.type)) {
			throw new BadRequestException('Invalid image type');
		}

		const result = await this.uploadService.uploadImage(
			file,
			uploadDto.type,
			uploadDto.entityId,
			uploadDto.entityType,
			uploadDto.folder
		);

		return {
			message: 'Image uploaded successfully',
			data: result,
		};
	}

	@Put('image/:id')
	@UseInterceptors(FileInterceptor('file'))
	@ApiOperation({
		summary: 'Update an existing image',
		description:
			'Replace an existing image with a new one. File must be under 5MB and in supported image format (jpg, jpeg, png, gif, webp).',
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['file'],
			properties: {
				file: {
					type: 'string',
					format: 'binary',
					description:
						'New image file to replace the existing one (max 5MB)',
				},
				folder: {
					type: 'string',
					description: 'Subfolder for organizing images (optional)',
					example: 'profile-photos',
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Image updated successfully',
		type: UploadResponseDto,
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 404, description: 'Image not found' })
	async updateImage(
		@Param('id') id: string,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
				],
			})
		)
		file: Express.Multer.File,
		@Body() body: { folder?: string }
	): Promise<UploadResponseDto> {
		if (!file) {
			throw new BadRequestException('No file uploaded');
		}

		// Validate MIME type
		validateImageMimeType(file);

		const result = await this.uploadService.updateImage(
			id,
			file,
			body.folder
		);

		return {
			message: 'Image updated successfully',
			data: result,
		};
	}

	@Delete('image/:id')
	@ApiOperation({
		summary: 'Delete an image',
		description: 'Permanently delete an image from storage and database.',
	})
	@ApiResponse({ status: 200, description: 'Image deleted successfully' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 404, description: 'Image not found' })
	async deleteImage(@Param('id') id: string) {
		await this.uploadService.deleteImage(id);

		return {
			message: 'Image deleted successfully',
		};
	}

	@Post('image/bulk')
	@UseInterceptors(FilesInterceptor('files', 10)) // Allow up to 10 files
	@ApiOperation({
		summary: 'Upload multiple images',
		description:
			'Upload multiple image files with metadata. Each file must be under 5MB and in supported image format (jpg, jpeg, png, gif, webp). Admin, Manager, or Dev role required. Use the same field name "files" for each file in your form data.',
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['files', 'type'],
			properties: {
				files: {
					type: 'array',
					items: {
						type: 'string',
						format: 'binary',
					},
					description:
						'Multiple image files to upload (max 5MB each). Use the same field name "files" for each file.',
				},
				type: {
					type: 'string',
					enum: Object.values(ImageEnum),
					description: 'Type of image being uploaded',
					example: ImageEnum.VEHICLE,
				},
				entityId: {
					type: 'string',
					format: 'uuid',
					description:
						'ID of the entity these images belong to (optional)',
					example: '123e4567-e89b-12d3-a456-426614174000',
				},
				entityType: {
					type: 'string',
					enum: ['user', 'vehicle', 'part'],
					description:
						'Type of entity these images belong to (optional)',
					example: 'vehicle',
				},
				folder: {
					type: 'string',
					description: 'Subfolder for organizing images (optional)',
					example: 'vehicle-gallery',
				},
			},
		},
	})
	@ApiResponse({
		status: 201,
		description: 'Images uploaded successfully',
		type: BulkUploadResponseDto,
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
	async uploadMultipleImages(
		@UploadedFiles(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
				],
			})
		)
		files: Express.Multer.File[],
		@Body() uploadDto: BulkUploadDto
	): Promise<BulkUploadResponseDto> {
		if (!files || files.length === 0) {
			throw new BadRequestException('No files uploaded');
		}

		if (!uploadDto.type) {
			throw new BadRequestException('Image type is required');
		}

		// Validate MIME types for all files
		for (const file of files) {
			validateImageMimeType(file);
		}

		const results = [];
		for (const file of files) {
			try {
				const result = await this.uploadService.uploadImage(
					file,
					uploadDto.type,
					uploadDto.entityId,
					uploadDto.entityType,
					uploadDto.folder
				);
				results.push({ data: result });
			} catch (error) {
				results.push({
					error: error.message,
					filename: file.originalname,
				});
			}
		}

		return {
			message: 'Bulk upload completed',
			data: results,
		};
	}

	@Get('stats')
	@ApiOperation({ summary: 'Get upload statistics' })
	@ApiResponse({
		status: 200,
		description: 'Statistics retrieved successfully',
		type: UploadStatsResponseDto,
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
	async getUploadStats(): Promise<UploadStatsResponseDto> {
		const stats = await this.uploadService.getImageStats();

		return {
			message: 'Upload statistics retrieved successfully',
			data: stats,
		};
	}

	@Get('images/:type')
	@ApiOperation({ summary: 'Get images by type' })
	@ApiResponse({
		status: 200,
		description: 'Images retrieved successfully',
		type: ImagesResponseDto,
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async getImagesByType(
		@Param('type') type: ImageEnum
	): Promise<ImagesResponseDto> {
		const images = await this.uploadService.getImagesByType(type);

		return {
			message: 'Images retrieved successfully',
			data: images,
		};
	}

	@Get('images/entity/:entityType/:entityId')
	@ApiOperation({ summary: 'Get images by entity' })
	@ApiResponse({
		status: 200,
		description: 'Images retrieved successfully',
		type: ImagesResponseDto,
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async getImagesByEntity(
		@Param('entityType') entityType: string,
		@Param('entityId') entityId: string
	): Promise<ImagesResponseDto> {
		const images = await this.uploadService.getImagesByEntity(
			entityId,
			entityType
		);

		return {
			message: 'Images retrieved successfully',
			data: images,
		};
	}
}
