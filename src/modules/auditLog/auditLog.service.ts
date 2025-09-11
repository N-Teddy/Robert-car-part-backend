import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { CreateAuditLogDto } from '../../dto/request/audit.dto';
import {
	AuditLogResponseDto,
	PaginatedAuditLogResponseDto,
	AuditLogFilterDto,
} from '../../dto/response/audit.dto';

@Injectable()
export class AuditLogService {
	private readonly logger = new Logger(AuditLogService.name);

	constructor(
		@InjectRepository(AuditLog)
		private readonly auditLogRepository: Repository<AuditLog>
	) {}

	async createAuditLog(
		createAuditLogDto: CreateAuditLogDto
	): Promise<AuditLog> {
		try {
			const auditLog = this.auditLogRepository.create(createAuditLogDto);
			const savedLog = await this.auditLogRepository.save(auditLog);
			this.logger.log(
				`Audit log created for user ${createAuditLogDto.userId}, action: ${createAuditLogDto.action}`
			);
			return savedLog;
		} catch (error) {
			this.logger.error(
				`Failed to create audit log: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	async findAllAuditLogs(
		filterDto: AuditLogFilterDto
	): Promise<PaginatedAuditLogResponseDto> {
		try {
			const {
				page = 1,
				limit = 10,
				userId,
				action,
				entity,
				route,
				startDate,
				endDate,
			} = filterDto;

			const skip = (page - 1) * limit;

			const whereConditions: any = {};

			if (userId) {
				whereConditions.userId = userId;
			}

			if (action) {
				whereConditions.action = action;
			}

			if (entity) {
				whereConditions.entity = entity;
			}

			if (route) {
				whereConditions.route = route;
			}

			if (startDate && endDate) {
				whereConditions.createdAt = Between(
					new Date(startDate),
					new Date(endDate)
				);
			} else if (startDate) {
				whereConditions.createdAt = Between(
					new Date(startDate),
					new Date()
				);
			} else if (endDate) {
				whereConditions.createdAt = Between(
					new Date('1970-01-01'),
					new Date(endDate)
				);
			}

			const findOptions: FindManyOptions<AuditLog> = {
				where: whereConditions,
				order: { createdAt: 'DESC' },
				skip,
				take: limit,
			};

			const [auditLogs, total] =
				await this.auditLogRepository.findAndCount(findOptions);

			const totalPages = Math.ceil(total / limit);

			return {
				data: auditLogs.map((log) => this.mapToResponseDto(log)),
				total,
				page,
				limit,
				totalPages,
			};
		} catch (error) {
			this.logger.error(
				`Failed to fetch audit logs: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	async findAuditLogById(id: string): Promise<AuditLogResponseDto> {
		try {
			const auditLog = await this.auditLogRepository.findOne({
				where: { id },
			});

			if (!auditLog) {
				throw new NotFoundException(
					`Audit log with ID ${id} not found`
				);
			}

			return this.mapToResponseDto(auditLog);
		} catch (error) {
			this.logger.error(
				`Failed to fetch audit log by ID ${id}: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	private mapToResponseDto(auditLog: AuditLog): AuditLogResponseDto {
		return {
			id: auditLog.id,
			userId: auditLog.user?.id || null,
			action: auditLog.action,
			entity: auditLog.entity,
			route: auditLog.route,
			requestBody: auditLog.details,
			ipAddress: auditLog.ipAddress,
			userAgent: auditLog.userAgent,
			createdAt: auditLog.createdAt,
			updatedAt: auditLog.updatedAt,
		};
	}
}
