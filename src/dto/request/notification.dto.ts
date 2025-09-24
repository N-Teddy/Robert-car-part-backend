import {
	IsEnum,
	IsString,
	IsOptional,
	IsArray,
	IsObject,
	IsBoolean,
	IsUUID,
	ValidateNested,
	IsNotEmpty,
	IsInt,
	Min,
	Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	NotificationEnum,
	NotificationAudienceEnum,
	NotificationChannelEnum,
} from '../../common/enum/notification.enum';
import { NotificationResponseDto } from '../response/notification.dto';

export class CreateNotificationDto {
	@ApiProperty({ enum: NotificationEnum })
	@IsEnum(NotificationEnum)
	type: NotificationEnum;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	message: string;

	@ApiPropertyOptional()
	@IsObject()
	@IsOptional()
	metadata?: Record<string, any>;

	@ApiPropertyOptional()
	@IsUUID()
	@IsOptional()
	userId?: string;
}

export class SendNotificationDto {
	@ApiProperty({ enum: NotificationEnum })
	@IsEnum(NotificationEnum)
	type: NotificationEnum;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	message: string;

	@ApiPropertyOptional()
	@IsObject()
	@IsOptional()
	metadata?: Record<string, any>;

	@ApiProperty({
		enum: NotificationAudienceEnum,
		description: 'Target audience for the notification',
	})
	@IsEnum(NotificationAudienceEnum)
	audience: NotificationAudienceEnum;

	@ApiPropertyOptional({
		type: [String],
		description: 'Specific user IDs (used when audience is SPECIFIC_USER)',
	})
	@IsArray()
	@IsUUID('4', { each: true })
	@IsOptional()
	userIds?: string[];

	@ApiPropertyOptional({
		enum: NotificationChannelEnum,
		default: NotificationChannelEnum.BOTH,
	})
	@IsEnum(NotificationChannelEnum)
	@IsOptional()
	channel?: NotificationChannelEnum = NotificationChannelEnum.BOTH;

	@ApiPropertyOptional({
		description: 'Custom email template name (optional)',
	})
	@IsString()
	@IsOptional()
	emailTemplate?: string;
}

export class BatchSendNotificationDto {
	@ApiProperty({ type: [SendNotificationDto] })
	@ValidateNested({ each: true })
	@Type(() => SendNotificationDto)
	notifications: SendNotificationDto[];
}

export class MarkAsReadDto {
	@ApiProperty({
		type: [String],
		description: 'Notification IDs to mark as read',
	})
	@IsArray()
	@IsUUID('4', { each: true })
	notificationIds: string[];
}

export class NotificationFilterDto {
	@ApiPropertyOptional({ enum: NotificationEnum })
	@IsEnum(NotificationEnum)
	@IsOptional()
	type?: NotificationEnum;

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	isRead?: boolean;

	@ApiPropertyOptional()
	@IsUUID()
	@IsOptional()
	userId?: string;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	search?: string;

	@ApiPropertyOptional({
		description: 'Page number (starting from 1)',
		minimum: 1,
		default: 1,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@IsOptional()
	page?: number = 1;

	@ApiPropertyOptional({
		description: 'Number of items per page',
		minimum: 1,
		maximum: 100,
		default: 20,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(1000)
	@IsOptional()
	limit?: number = 10;
}

// Simplified response interface for interceptor compatibility
export class NotificationListResponseDto {
	@ApiProperty({ type: [NotificationResponseDto] })
	items: NotificationResponseDto[];

	@ApiProperty({ description: 'Total number of notifications' })
	total: number;

	@ApiProperty({ description: 'Current page number' })
	page: number;

	@ApiProperty({ description: 'Number of items per page' })
	limit: number;

	@ApiProperty({ description: 'Total number of pages' })
	totalPages: number;

	@ApiProperty({ description: 'Whether there is a next page' })
	hasNext: boolean;

	@ApiProperty({ description: 'Whether there is a previous page' })
	hasPrev: boolean;
}
