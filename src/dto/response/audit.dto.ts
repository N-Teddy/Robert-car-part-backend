import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditActionEnum } from 'src/common/enum/entity.enum';

export class AuditLogResponseDto {
	@ApiProperty({ description: 'Audit log ID' })
	id: string;

	@ApiPropertyOptional({ description: 'User ID who performed the action' })
	userId: string;

	@ApiProperty({ description: 'Action performed', enum: AuditActionEnum })
	action: AuditActionEnum;

	@ApiProperty({ description: 'Entity affected by the action' })
	entity: string;

	@ApiProperty({ description: 'Route that was accessed' })
	route: string;

	@ApiPropertyOptional({ description: 'Request body data' })
	requestBody?: any;

	@ApiPropertyOptional({ description: 'Request headers' })
	requestHeaders?: any;

	@ApiPropertyOptional({ description: 'User IP address' })
	ipAddress?: string;

	@ApiPropertyOptional({ description: 'User agent string' })
	userAgent?: string;

	@ApiProperty({ description: 'Timestamp when the action was performed' })
	createdAt: Date;

	@ApiProperty({ description: 'Last updated timestamp' })
	updatedAt: Date;
}

export class PaginatedAuditLogResponseDto {
	@ApiProperty({ type: [AuditLogResponseDto] })
	data: AuditLogResponseDto[];

	@ApiProperty({ description: 'Total number of records' })
	total: number;

	@ApiProperty({ description: 'Current page number' })
	page: number;

	@ApiProperty({ description: 'Number of records per page' })
	limit: number;

	@ApiProperty({ description: 'Total number of pages' })
	totalPages: number;
}

export class AuditLogFilterDto {
	@ApiPropertyOptional({
		description: 'Page number for pagination',
		default: 1,
	})
	page?: number = 1;

	@ApiPropertyOptional({
		description: 'Number of records per page',
		default: 10,
	})
	limit?: number = 10;

	@ApiPropertyOptional({ description: 'Filter by user ID' })
	userId?: string;

	@ApiPropertyOptional({
		description: 'Filter by action',
		enum: AuditActionEnum,
	})
	action?: AuditActionEnum;

	@ApiPropertyOptional({ description: 'Filter by entity' })
	entity?: string;

	@ApiPropertyOptional({ description: 'Filter by route' })
	route?: string;

	@ApiPropertyOptional({
		description: 'Start date for date range filter (ISO string)',
	})
	startDate?: string;

	@ApiPropertyOptional({
		description: 'End date for date range filter (ISO string)',
	})
	endDate?: string;
}
