// src/modules/vehicle/vehicle.service.ts
import {
	Injectable,
	Logger,
	NotFoundException,
	ConflictException,
	InternalServerErrorException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	Repository,
	FindManyOptions,
	ILike,
	Between,
	MoreThanOrEqual,
	LessThanOrEqual,
} from 'typeorm';
import { Vehicle } from '../../entities/vehicle.entity';
import { Image } from '../../entities/image.entity';
import { VehicleResponseDto } from '../../dto/response/vehicle.dto';
import { UploadService } from '../upload/upload.service';
import { NotificationService } from '../notification/notification.service';
import { ImageEnum } from '../../common/enum/entity.enum';
import {
	NotificationAudienceEnum,
	NotificationChannelEnum,
	NotificationEnum,
} from '../../common/enum/notification.enum';
import {
	CreateVehicleDto,
	UpdateVehicleDto,
} from 'src/dto/request/vehicle.dto';
import { VehicleProfit } from 'src/entities/vehicle-profit.entity';

@Injectable()
export class VehicleService {
	private readonly logger = new Logger(VehicleService.name);

	constructor(
		@InjectRepository(Vehicle)
		private readonly vehicleRepository: Repository<Vehicle>,
		@InjectRepository(Image)
		@InjectRepository(VehicleProfit) // Add this repository
		private readonly vehicleProfitRepository: Repository<VehicleProfit>,
		private readonly uploadService: UploadService,
		private readonly notificationService: NotificationService
	) {}

	async create(
		dto: CreateVehicleDto,
		imageFiles: Express.Multer.File[],
		userId: string
	): Promise<VehicleResponseDto> {
		try {
			// Check if VIN already exists
			const existingVehicle = await this.vehicleRepository.findOne({
				where: { vin: dto.vin },
			});
			if (existingVehicle) {
				throw new ConflictException(
					'Vehicle with this VIN already exists'
				);
			}

			const vehicle = this.vehicleRepository.create({
				...dto,
				createdBy: userId,
			});

			const savedVehicle: Vehicle =
				await this.vehicleRepository.save(vehicle);

			// Upload images if provided
			if (imageFiles && imageFiles.length > 0) {
				await Promise.all(
					imageFiles.map((file) =>
						this.uploadService.uploadSingleImage(
							file,
							ImageEnum.VEHICLE,
							savedVehicle.id,
							userId
						)
					)
				);
			}

			// Send notification to admins
			await this.notificationService.sendNotification({
				type: NotificationEnum.VEHICLE_CREATED,
				title: 'New Vehicle Added',
				message: `Vehicle ${dto.make} ${dto.model} (${dto.year}) has been added to the system.`,
				audience: NotificationAudienceEnum.ADMIN,
				channel: NotificationChannelEnum.WEBSOCKET,
				metadata: {
					vehicleId: savedVehicle.id,
					make: dto.make,
					model: dto.model,
					year: dto.year,
					vin: dto.vin,
				},
			});

			// Reload with relations for response
			const vehicleWithRelations = await this.vehicleRepository.findOne({
				where: { id: savedVehicle.id },
				relations: ['images'],
			});

			return VehicleResponseDto.fromEntity(vehicleWithRelations);
		} catch (error) {
			this.logger.error('Failed to create vehicle', error);
			if (error instanceof ConflictException) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to create vehicle');
		}
	}

	async findAll(
		page: number = 1,
		limit: number = 10,
		search?: string,
		make?: string,
		model?: string,
		year?: number,
		minYear?: number,
		maxYear?: number,
		isPartedOut?: boolean
	): Promise<{
		data: VehicleResponseDto[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	}> {
		try {
			const skip = (page - 1) * limit;
			const options: FindManyOptions<Vehicle> = {
				relations: ['images'],
				order: { createdAt: 'DESC' },
				skip,
				take: limit,
			};

			options.where = {};

			if (search) {
				options.where = [
					{ make: ILike(`%${search}%`) },
					{ model: ILike(`%${search}%`) },
					{ vin: ILike(`%${search}%`) },
					{ description: ILike(`%${search}%`) },
				];
			}

			if (make) {
				options.where = { ...options.where, make: ILike(`%${make}%`) };
			}

			if (model) {
				options.where = {
					...options.where,
					model: ILike(`%${model}%`),
				};
			}

			if (year) {
				options.where = { ...options.where, year };
			}

			if (minYear !== undefined && maxYear !== undefined) {
				options.where = {
					...options.where,
					year: Between(minYear, maxYear),
				};
			} else if (minYear !== undefined) {
				options.where = {
					...options.where,
					year: MoreThanOrEqual(minYear),
				};
			} else if (maxYear !== undefined) {
				options.where = {
					...options.where,
					year: LessThanOrEqual(maxYear),
				};
			}

			if (isPartedOut !== undefined) {
				options.where = { ...options.where, isPartedOut };
			}

			const [rows, total] =
				await this.vehicleRepository.findAndCount(options);
			const totalPages = Math.ceil(total / limit);
			const hasNext = page < totalPages;
			const hasPrev = page > 1;

			return {
				data: rows.map(VehicleResponseDto.fromEntity),
				total,
				page,
				limit,
				totalPages,
				hasNext,
				hasPrev,
			};
		} catch (error) {
			this.logger.error('Failed to fetch vehicles', error);
			throw new InternalServerErrorException('Failed to fetch vehicles');
		}
	}

	async findOne(id: string): Promise<VehicleResponseDto> {
		try {
			const vehicle = await this.vehicleRepository.findOne({
				where: { id },
				relations: ['images', 'parts', 'profitRecords'],
			});

			if (!vehicle) {
				throw new NotFoundException('Vehicle not found');
			}

			return VehicleResponseDto.fromEntity(vehicle);
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to fetch vehicle');
		}
	}

	async update(
		id: string,
		dto: UpdateVehicleDto,
		imageFiles: Express.Multer.File[],
		userId: string
	): Promise<VehicleResponseDto> {
		try {
			const vehicle = await this.vehicleRepository.findOne({
				where: { id },
				relations: ['images'],
			});

			if (!vehicle) {
				throw new NotFoundException('Vehicle not found');
			}

			// Check if VIN is being changed and if it already exists
			if (dto.vin && dto.vin !== vehicle.vin) {
				const existingVehicle = await this.vehicleRepository.findOne({
					where: { vin: dto.vin },
				});
				if (existingVehicle && existingVehicle.id !== id) {
					throw new ConflictException(
						'Vehicle with this VIN already exists'
					);
				}
			}
			// Update vehicle fields
			const cleanedDto = Object.fromEntries(
				Object.entries(dto).filter(
					([_, v]) => v !== '' && v !== null && v !== undefined
				)
			);
			Object.assign(vehicle, cleanedDto);
			vehicle.updatedBy = userId;
			const savedVehicle = await this.vehicleRepository.save(vehicle);

			// Upload new images if provided
			if (imageFiles && imageFiles.length > 0) {
				await Promise.all(
					imageFiles.map((file) =>
						this.uploadService.uploadSingleImage(
							file,
							ImageEnum.VEHICLE,
							savedVehicle.id,
							userId
						)
					)
				);
			}

			// Send notification to admins
			await this.notificationService.sendNotification({
				type: NotificationEnum.VEHICLE_UPDATED,
				title: 'Vehicle Updated',
				message: `Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) has been updated.`,
				audience: NotificationAudienceEnum.ADMIN,
				channel: NotificationChannelEnum.WEBSOCKET,
				metadata: {
					vehicleId: savedVehicle.id,
					make: vehicle.make,
					model: vehicle.model,
					year: vehicle.year,
					vin: vehicle.vin,
				},
			});

			// Reload with relations
			const updatedVehicle = await this.vehicleRepository.findOne({
				where: { id: savedVehicle.id },
				relations: ['images'],
			});

			return VehicleResponseDto.fromEntity(updatedVehicle);
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof ConflictException
			) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to update vehicle');
		}
	}

	async remove(id: string, userId: string): Promise<{ success: true }> {
		try {
			const vehicle = await this.vehicleRepository.findOne({
				where: { id },
				relations: ['images', 'parts'],
			});

			if (!vehicle) {
				throw new NotFoundException('Vehicle not found');
			}

			// Check if vehicle has parts
			if (vehicle.parts && vehicle.parts.length > 0) {
				throw new BadRequestException(
					'Cannot delete vehicle with associated parts'
				);
			}

			// Delete associated images
			if (vehicle.images && vehicle.images.length > 0) {
				await Promise.all(
					vehicle.images.map((image) =>
						this.uploadService.deleteImage(image.id)
					)
				);
			}

			await this.vehicleRepository.remove(vehicle);

			// Send notification to admins
			await this.notificationService.sendNotification({
				type: NotificationEnum.VEHICLE_DELETED,
				title: 'Vehicle Deleted',
				message: `Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) has been deleted.`,
				audience: NotificationAudienceEnum.ADMIN,
				channel: NotificationChannelEnum.WEBSOCKET,
				metadata: {
					vehicleId: id,
					make: vehicle.make,
					model: vehicle.model,
					year: vehicle.year,
					vin: vehicle.vin,
				},
			});

			return { success: true };
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to delete vehicle');
		}
	}

	async markAsPartedOut(
		id: string,
		userId: string
	): Promise<VehicleResponseDto> {
		try {
			const vehicle = await this.vehicleRepository.findOne({
				where: { id },
				relations: ['images'],
			});

			if (!vehicle) {
				throw new NotFoundException('Vehicle not found');
			}

			vehicle.isPartedOut = true;
			vehicle.updatedBy = userId;
			const savedVehicle = await this.vehicleRepository.save(vehicle);

			// Send notification to admins
			await this.notificationService.sendNotification({
				type: NotificationEnum.VEHICLE_PARTED_OUT,
				title: 'Vehicle Parted Out',
				message: `Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) has been marked as parted out.`,
				audience: NotificationAudienceEnum.ADMIN,
				channel: NotificationChannelEnum.WEBSOCKET,
				metadata: {
					vehicleId: savedVehicle.id,
					make: vehicle.make,
					model: vehicle.model,
					year: vehicle.year,
					vin: vehicle.vin,
				},
			});

			return VehicleResponseDto.fromEntity(savedVehicle);
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException(
				'Failed to mark vehicle as parted out'
			);
		}
	}

	// Statistics methods
	async getStatistics(): Promise<any> {
		try {
			const totalVehicles = await this.vehicleRepository.count();
			const activeVehicles = await this.vehicleRepository.count({
				where: { isActive: true },
			});
			const partedOutVehicles = await this.vehicleRepository.count({
				where: { isPartedOut: true },
			});

			const currentYear = new Date().getFullYear();
			const vehiclesThisYear = await this.vehicleRepository.count({
				where: {
					purchaseDate: Between(
						new Date(`${currentYear}-01-01`),
						new Date(`${currentYear}-12-31`)
					),
				},
			});

			// Add profit statistics
			const profitStats = await this.vehicleProfitRepository
				.createQueryBuilder('vp')
				.select('SUM(vp.totalPartsRevenue)', 'totalRevenue')
				.addSelect('SUM(vp.totalPartsCost)', 'totalCost')
				.addSelect('SUM(vp.profit)', 'totalProfit')
				.addSelect('AVG(vp.profitMargin)', 'avgProfitMargin')
				.getRawOne();

			const profitableVehicles = await this.vehicleProfitRepository.count({
				where: { profit: MoreThanOrEqual(0) }
			});

			return {
				totalVehicles,
				activeVehicles,
				partedOutVehicles,
				vehiclesThisYear,
				totalRevenue: parseFloat(profitStats.totalRevenue || 0),
				totalCost: parseFloat(profitStats.totalCost || 0),
				totalProfit: parseFloat(profitStats.totalProfit || 0),
				avgProfitMargin: parseFloat(profitStats.avgProfitMargin || 0),
				profitableVehicles,
				profitabilityRate: totalVehicles > 0 ? (profitableVehicles / totalVehicles) * 100 : 0
			};
		} catch (error) {
			this.logger.error('Failed to fetch vehicle statistics', error);
			throw new InternalServerErrorException(
				'Failed to fetch vehicle statistics'
			);
		}
	}

	async getVehicleProfitStats(vehicleId: string): Promise<VehicleProfit> {
		try {
			const profitRecord = await this.vehicleProfitRepository.findOne({
				where: { vehicle: { id: vehicleId } },
				relations: ['vehicle']
			});

			if (!profitRecord) {
				// Return default profit record if none exists
				return this.vehicleProfitRepository.create({
					totalPartsRevenue: 0,
					totalPartsCost: 0,
					profit: 0,
					profitMargin: 0,
					isThresholdMet: false,
					vehicle: { id: vehicleId }
				});
			}

			return profitRecord;
		} catch (error) {
			this.logger.error('Failed to fetch vehicle profit stats', error);
			throw new InternalServerErrorException('Failed to fetch vehicle profit statistics');
		}
	}

	async getAllVehicleProfits(): Promise<VehicleProfit[]> {
		try {
			return await this.vehicleProfitRepository.find({
				relations: ['vehicle'],
				order: { profit: 'DESC' }
			});
		} catch (error) {
			this.logger.error('Failed to fetch vehicle profits', error);
			throw new InternalServerErrorException('Failed to fetch vehicle profits');
		}
	}

	// Add method to get vehicles with best profit margins
	async getTopPerformingVehicles(limit: number = 10): Promise<VehicleProfit[]> {
		try {
			return await this.vehicleProfitRepository.find({
				where: { profitMargin: MoreThanOrEqual(0) },
				relations: ['vehicle'],
				order: { profitMargin: 'DESC' },
				take: limit
			});
		} catch (error) {
			this.logger.error('Failed to fetch top performing vehicles', error);
			throw new InternalServerErrorException('Failed to fetch top performing vehicles');
		}
	}


	async getMakeModelStatistics(): Promise<any> {
		try {
			const makeStats = await this.vehicleRepository
				.createQueryBuilder('vehicle')
				.select('vehicle.make', 'make')
				.addSelect('COUNT(vehicle.id)', 'count')
				.groupBy('vehicle.make')
				.orderBy('count', 'DESC')
				.getRawMany();

			const modelStats = await this.vehicleRepository
				.createQueryBuilder('vehicle')
				.select('vehicle.model', 'model')
				.addSelect('COUNT(vehicle.id)', 'count')
				.groupBy('vehicle.model')
				.orderBy('count', 'DESC')
				.getRawMany();

			return {
				byMake: makeStats,
				byModel: modelStats,
			};
		} catch (error) {
			this.logger.error('Failed to fetch make/model statistics', error);
			throw new InternalServerErrorException(
				'Failed to fetch make/model statistics'
			);
		}
	}
}
