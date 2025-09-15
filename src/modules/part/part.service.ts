// src/modules/part/part.service.ts
import {
	Injectable,
	Logger,
	NotFoundException,
	InternalServerErrorException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Part } from '../../entities/part.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Category } from '../../entities/category.entity';
import { QrCode } from '../../entities/qr-code.entity';
import { Image } from '../../entities/image.entity';
import { PartResponseDto } from '../../dto/response/part.dto';
import { UploadService } from '../upload/upload.service';
import { NotificationService } from '../notification/notification.service';
import { ImageEnum } from '../../common/enum/entity.enum';
import {
	NotificationAudienceEnum,
	NotificationChannelEnum,
	NotificationEnum,
} from '../../common/enum/notification.enum';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { CreatePartDto, UpdatePartDto } from 'src/dto/request/part.dto';
import { Readable } from 'stream';

@Injectable()
export class PartService {
	private readonly logger = new Logger(PartService.name);

	constructor(
		@InjectRepository(Part)
		private readonly partRepository: Repository<Part>,
		@InjectRepository(Vehicle)
		private readonly vehicleRepository: Repository<Vehicle>,
		@InjectRepository(Category)
		private readonly categoryRepository: Repository<Category>,
		@InjectRepository(QrCode)
		private readonly qrCodeRepository: Repository<QrCode>,
		@InjectRepository(Image)
		private readonly imageRepository: Repository<Image>,
		private readonly uploadService: UploadService,
		private readonly notificationService: NotificationService
	) {}

	async create(
		dto: CreatePartDto,
		imageFiles: Express.Multer.File[],
		userId: string
	): Promise<PartResponseDto> {
		try {
			// Validate vehicle exists
			const vehicle = await this.vehicleRepository.findOne({
				where: { id: dto.vehicleId },
			});
			if (!vehicle) {
				throw new NotFoundException('Vehicle not found');
			}

			// Validate category exists
			const category = await this.categoryRepository.findOne({
				where: { id: dto.categoryId },
			});
			if (!category) {
				throw new NotFoundException('Category not found');
			}

			const part = this.partRepository.create({
				...dto,
				vehicle: { id: dto.vehicleId } as any,
				category: { id: dto.categoryId } as any,
				createdBy: userId,
			});

			const savedPart: Part = await this.partRepository.save(part);

			// Generate QR code
			await this.generateQrCodeForPart(savedPart, userId);

			// Upload images if provided
			if (imageFiles && imageFiles.length > 0) {
				await Promise.all(
					imageFiles.map((file) =>
						this.uploadService.uploadSingleImage(
							file,
							ImageEnum.PART,
							savedPart.id,
							userId
						)
					)
				);
			}

			// Send notification to admins
			await this.notificationService.sendNotification({
				type: NotificationEnum.PART_CREATED,
				title: 'New Part Added',
				message: `Part "${dto.name}" has been added to the system.`,
				audience: NotificationAudienceEnum.ADMIN,
				channel: NotificationChannelEnum.WEBSOCKET,
				metadata: {
					partId: savedPart.id,
					partName: dto.name,
					vehicleId: dto.vehicleId,
					categoryId: dto.categoryId,
					price: dto.price,
					quantity: dto.quantity,
				},
			});

			// Reload with relations for response
			const partWithRelations = await this.partRepository.findOne({
				where: { id: savedPart.id },
				relations: [
					'images',
					'vehicle',
					'category',
					'qrCode',
					'qrCode.image',
				],
			});

			return PartResponseDto.fromEntity(partWithRelations);
		} catch (error) {
			this.logger.error('Failed to create part', error);
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to create part');
		}
	}

	private async generateQrCodeForPart(
		part: Part,
		userId: string
	): Promise<void> {
		try {
			const qrData = JSON.stringify({
				partId: part.id,
				name: part.name,
				partNumber: part.partNumber,
				price: part.price,
				createdAt: new Date().toISOString(),
			});

			// Generate QR code as buffer
			const qrCodeBuffer = await QRCode.toBuffer(qrData, {
				width: 300,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#FFFFFF',
				},
			});

			// Create QR code entity
			const qrCode = this.qrCodeRepository.create({
				data: qrData,
				encodedData: qrData,
				part: { id: part.id },
			});

			const savedQrCode = await this.qrCodeRepository.save(qrCode);

			// Create a mock file object
			const mockFile: any = {
				originalname: `qr-code-${part.id}.png`,
				mimetype: 'image/png',
				buffer: qrCodeBuffer,
				size: qrCodeBuffer.length,
			};

			// Upload QR code as image
			const uploadedImage = await this.uploadService.uploadSingleImage(
				mockFile,
				ImageEnum.QR_CODE,
				savedQrCode.id, // Use part ID as entity ID
				userId
			);

			// Update the image with QR code relationship
			await this.imageRepository.update(uploadedImage.id, {
				qrCode: { id: savedQrCode.id },
			});

			this.logger.log(`QR code generated for part ${part.id}`);
		} catch (error) {
			this.logger.error('Failed to generate QR code for part', error);
			// Don't throw error - part creation shouldn't fail because of QR code
		}
	}

	async findAll(
		page: number = 1,
		limit: number = 10,
		search?: string,
		vehicleId?: string,
		categoryId?: string,
		minPrice?: number,
		maxPrice?: number,
		minQuantity?: number,
		maxQuantity?: number,
		condition?: string
	): Promise<{
		data: PartResponseDto[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	}> {
		try {
			const skip = (page - 1) * limit;
			const query = this.partRepository
				.createQueryBuilder('part')
				.leftJoinAndSelect('part.images', 'images')
				.leftJoinAndSelect('part.vehicle', 'vehicle')
				.leftJoinAndSelect('part.category', 'category')
				.leftJoinAndSelect('part.qrCode', 'qrCode')
				.leftJoinAndSelect('qrCode.image', 'qrCodeImage')
				.orderBy('part.createdAt', 'DESC');

			// Apply filters
			if (search) {
				query.where(
					'(part.name ILIKE :search OR part.description ILIKE :search OR part.partNumber ILIKE :search)',
					{
						search: `%${search}%`,
					}
				);
			}

			if (vehicleId) {
				query.andWhere('part.vehicleId = :vehicleId', { vehicleId });
			}

			if (categoryId) {
				query.andWhere('part.categoryId = :categoryId', { categoryId });
			}

			if (minPrice !== undefined && maxPrice !== undefined) {
				query.andWhere('part.price BETWEEN :minPrice AND :maxPrice', {
					minPrice,
					maxPrice,
				});
			} else if (minPrice !== undefined) {
				query.andWhere('part.price >= :minPrice', { minPrice });
			} else if (maxPrice !== undefined) {
				query.andWhere('part.price <= :maxPrice', { maxPrice });
			}

			if (minQuantity !== undefined && maxQuantity !== undefined) {
				query.andWhere(
					'part.quantity BETWEEN :minQuantity AND :maxQuantity',
					{ minQuantity, maxQuantity }
				);
			} else if (minQuantity !== undefined) {
				query.andWhere('part.quantity >= :minQuantity', {
					minQuantity,
				});
			} else if (maxQuantity !== undefined) {
				query.andWhere('part.quantity <= :maxQuantity', {
					maxQuantity,
				});
			}

			if (condition) {
				query.andWhere('part.condition = :condition', { condition });
			}

			const [parts, total] = await query
				.skip(skip)
				.take(limit)
				.getManyAndCount();

			const totalPages = Math.ceil(total / limit);
			const hasNext = page < totalPages;
			const hasPrev = page > 1;

			return {
				data: parts.map(PartResponseDto.fromEntity),
				total,
				page,
				limit,
				totalPages,
				hasNext,
				hasPrev,
			};
		} catch (error) {
			this.logger.error('Failed to fetch parts', error);
			throw new InternalServerErrorException('Failed to fetch parts');
		}
	}

	async findOne(id: string): Promise<PartResponseDto> {
		try {
			const part = await this.partRepository.findOne({
				where: { id },
				relations: [
					'images',
					'vehicle',
					'category',
					'qrCode',
					'qrCode.image',
					'orderItems',
				],
			});

			if (!part) {
				throw new NotFoundException('Part not found');
			}

			return PartResponseDto.fromEntity(part);
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to fetch part');
		}
	}

	async update(
		id: string,
		dto: UpdatePartDto,
		imageFiles: Express.Multer.File[],
		userId: string
	): Promise<PartResponseDto> {
		try {
			const part = await this.partRepository.findOne({
				where: { id },
				relations: ['images', 'vehicle', 'category'],
			});

			if (!part) {
				throw new NotFoundException('Part not found');
			}

			// Validate vehicle if provided
			if (dto.vehicleId) {
				const vehicle = await this.vehicleRepository.findOne({
					where: { id: dto.vehicleId },
				});
				if (!vehicle) {
					throw new NotFoundException('Vehicle not found');
				}
			}

			// Validate category if provided
			if (dto.categoryId) {
				const category = await this.categoryRepository.findOne({
					where: { id: dto.categoryId },
				});
				if (!category) {
					throw new NotFoundException('Category not found');
				}
			}

			// Update part fields
			Object.assign(part, dto);
			if (dto.vehicleId) part.vehicle = { id: dto.vehicleId } as any;
			if (dto.categoryId) part.category = { id: dto.categoryId } as any;
			part.updatedBy = userId;

			const savedPart = await this.partRepository.save(part);

			// Upload new images if provided
			if (imageFiles && imageFiles.length > 0) {
				await Promise.all(
					imageFiles.map((file) =>
						this.uploadService.uploadSingleImage(
							file,
							ImageEnum.PART,
							savedPart.id,
							userId
						)
					)
				);
			}

			// Send notification to admins
			await this.notificationService.sendNotification({
				type: NotificationEnum.PART_UPDATED,
				title: 'Part Updated',
				message: `Part "${part.name}" has been updated.`,
				audience: NotificationAudienceEnum.ADMIN,
				channel: NotificationChannelEnum.WEBSOCKET,
				metadata: {
					partId: savedPart.id,
					partName: part.name,
					vehicleId: part.vehicle?.id,
					categoryId: part.category?.id,
				},
			});

			// Reload with relations
			const updatedPart = await this.partRepository.findOne({
				where: { id: savedPart.id },
				relations: [
					'images',
					'vehicle',
					'category',
					'qrCode',
					'qrCode.image',
				],
			});

			return PartResponseDto.fromEntity(updatedPart);
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to update part');
		}
	}

	async remove(id: string, userId: string): Promise<{ success: true }> {
		const queryRunner =
			this.partRepository.manager.connection.createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const part = await queryRunner.manager.findOne(Part, {
				where: { id },
				relations: ['images', 'orderItems', 'qrCode', 'qrCode.image'],
			});

			if (!part) {
				throw new NotFoundException('Part not found');
			}

			if (part.orderItems && part.orderItems.length > 0) {
				throw new BadRequestException(
					'Cannot delete part with associated orders'
				);
			}

			// 1. Delete QR code and its image first (since QR code owns the relationships)
			if (part.qrCode) {
				if (part.qrCode.image) {
					await this.uploadService.deleteImage(part.qrCode.image.id);
					// await queryRunner.manager.delete(Image, part.qrCode.image.id);
				}
				// await queryRunner.manager.delete(QrCode, part.qrCode.id);
			}

			// 2. Delete part images
			if (part.images && part.images.length > 0) {
				for (const image of part.images) {
					await this.uploadService.deleteImage(image.id);
					// await queryRunner.manager.delete(Image, image.id);
				}
			}

			// 3. Finally delete the part
			await queryRunner.manager.delete(Part, id);
			await queryRunner.commitTransaction();

			// Send notification
			await this.notificationService.sendNotification({
				type: NotificationEnum.PART_DELETED,
				title: 'Part Deleted',
				message: `Part "${part.name}" has been deleted.`,
				audience: NotificationAudienceEnum.ADMIN,
				channel: NotificationChannelEnum.WEBSOCKET,
				metadata: {
					partId: id,
					partName: part.name,
				},
			});

			return { success: true };
		} catch (error) {
			await queryRunner.rollbackTransaction();

			if (
				error instanceof NotFoundException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			this.logger.error('Failed to delete part', error);
			throw new InternalServerErrorException('Failed to delete part');
		} finally {
			await queryRunner.release();
		}
	}

	// Statistics methods
	async getStatistics(): Promise<any> {
		try {
			const totalParts = await this.partRepository.count();
			const lowStockParts = await this.partRepository.count({
				where: { quantity: LessThanOrEqual(5) },
			});
			const outOfStockParts = await this.partRepository.count({
				where: { quantity: 0 },
			});

			const totalValue = await this.partRepository
				.createQueryBuilder('part')
				.select('SUM(part.price * part.quantity)', 'totalValue')
				.getRawOne();

			return {
				totalParts,
				lowStockParts,
				outOfStockParts,
				totalValue: parseFloat(totalValue.totalValue) || 0,
			};
		} catch (error) {
			this.logger.error('Failed to fetch part statistics', error);
			throw new InternalServerErrorException(
				'Failed to fetch part statistics'
			);
		}
	}

	async getCategoryStatistics(): Promise<any> {
		try {
			const categoryStats = await this.partRepository
				.createQueryBuilder('part')
				.leftJoin('part.category', 'category')
				.select('category.name', 'categoryName')
				.addSelect('COUNT(part.id)', 'count')
				.addSelect('SUM(part.price * part.quantity)', 'totalValue')
				.groupBy('category.name')
				.orderBy('count', 'DESC')
				.getRawMany();

			return categoryStats;
		} catch (error) {
			this.logger.error('Failed to fetch category statistics', error);
			throw new InternalServerErrorException(
				'Failed to fetch category statistics'
			);
		}
	}

	async getLowStockParts(): Promise<PartResponseDto[]> {
		try {
			const lowStockParts = await this.partRepository.find({
				where: { quantity: LessThanOrEqual(5) },
				relations: ['images', 'vehicle', 'category'],
				order: { quantity: 'ASC' },
				take: 20, // Limit to top 20 low stock items
			});

			return lowStockParts.map(PartResponseDto.fromEntity);
		} catch (error) {
			this.logger.error('Failed to fetch low stock parts', error);
			throw new InternalServerErrorException(
				'Failed to fetch low stock parts'
			);
		}
	}
}
