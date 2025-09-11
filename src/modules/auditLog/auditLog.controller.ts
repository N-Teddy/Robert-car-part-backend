import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiQuery,
} from '@nestjs/swagger';
import { AuditLogService } from './auditLog.service';
import {
	AuditLogResponseDto,
	PaginatedAuditLogResponseDto,
	AuditLogFilterDto,
} from '../../dto/response/audit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ResponseMessage } from '../../common/decorator/response-message.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditLogController {
	constructor(private readonly auditLogService: AuditLogService) {}

	@Get()
	@ApiOperation({ summary: 'Get all audit logs with pagination and filters' })
	@ApiResponse({
		status: 200,
		description: 'Audit logs retrieved successfully',
		type: PaginatedAuditLogResponseDto,
	})
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Page number',
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Records per page',
	})
	@ApiQuery({
		name: 'userId',
		required: false,
		type: String,
		description: 'Filter by user ID',
	})
	@ApiQuery({
		name: 'action',
		required: false,
		enum: ['CREATE', 'UPDATE', 'DELETE'],
		description: 'Filter by action',
	})
	@ApiQuery({
		name: 'entity',
		required: false,
		type: String,
		description: 'Filter by entity',
	})
	@ApiQuery({
		name: 'route',
		required: false,
		type: String,
		description: 'Filter by route',
	})
	@ApiQuery({
		name: 'startDate',
		required: false,
		type: String,
		description: 'Start date (ISO string)',
	})
	@ApiQuery({
		name: 'endDate',
		required: false,
		type: String,
		description: 'End date (ISO string)',
	})
	async findAll(
		@Query() filterDto: AuditLogFilterDto
	): Promise<PaginatedAuditLogResponseDto> {
		try {
			return await this.auditLogService.findAllAuditLogs(filterDto);
		} catch (error) {
			throw error;
		}
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get audit log by ID' })
	@ApiResponse({
		status: 200,
		description: 'Audit log retrieved successfully',
		type: AuditLogResponseDto,
	})
	@ApiResponse({ status: 404, description: 'Audit log not found' })
	async findOne(@Param('id') id: string): Promise<AuditLogResponseDto> {
		try {
			return await this.auditLogService.findAuditLogById(id);
		} catch (error) {
			throw error;
		}
	}
}
