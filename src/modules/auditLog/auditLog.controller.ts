import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditLogService } from './auditLog.service';
import {
	AuditLogResponseDto,
	PaginatedAuditLogResponseDto,
	AuditLogFilterDto,
} from '../../dto/response/audit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditLogController {
	constructor(private readonly auditLogService: AuditLogService) {}

	@Get()
	@ApiOperation({ summary: 'Get all audit logs with pagination and filters' })
	@ApiResponse({ status: 200, type: PaginatedAuditLogResponseDto })
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
	@ApiResponse({ status: 200, type: AuditLogResponseDto })
	async findOne(@Param('id') id: string): Promise<AuditLogResponseDto> {
		try {
			return await this.auditLogService.findAuditLogById(id);
		} catch (error) {
			throw error;
		}
	}
}
