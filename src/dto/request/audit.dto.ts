import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditActionEnum } from 'src/common/enum/entity.enum';

export class CreateAuditLogDto {
	@ApiProperty({ description: 'User ID who performed the action' })
	@IsString()
	userId: string;

	@ApiProperty({ description: 'Action performed', enum: AuditActionEnum })
	@IsEnum(AuditActionEnum)
	action: AuditActionEnum;

	@ApiProperty({ description: 'Entity affected by the action' })
	@IsString()
	entity: string;

	@ApiProperty({ description: 'Route that was accessed' })
	@IsString()
	route: string;

	@ApiProperty({ description: 'HTTP method used' })
	@IsString()
	method: string;

	@ApiPropertyOptional({ description: 'Request body data' })
	@IsOptional()
	@IsObject()
	requestBody?: any;

	@ApiPropertyOptional({ description: 'Request headers' })
	@IsOptional()
	@IsObject()
	requestHeaders?: any;

	@ApiPropertyOptional({ description: 'User IP address' })
	@IsOptional()
	@IsString()
	ipAddress?: string;

	@ApiPropertyOptional({ description: 'User agent string' })
	@IsOptional()
	@IsString()
	userAgent?: string;
}
