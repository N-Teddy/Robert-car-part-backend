// src/dto/request/notification.dto.ts
import { IsEnum, IsOptional, IsString, IsUUID, IsObject, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationChannel, NotificationPriority, NotificationStatus, NotificationType } from 'src/common/enum/notification.enum';

export class CreateNotificationDto {
    @ApiProperty()
    @IsUUID()
    userId: string;

    @ApiProperty({ enum: NotificationType })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty({ enum: NotificationChannel })
    @IsEnum(NotificationChannel)
    channel: NotificationChannel;

    @ApiPropertyOptional({ enum: NotificationPriority })
    @IsEnum(NotificationPriority)
    @IsOptional()
    priority?: NotificationPriority;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    content: string;

    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;

    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    payload?: Record<string, any>;
}

export class UpdateNotificationPreferencesDto {
    @ApiPropertyOptional()
    @IsOptional()
    email?: {
        enabled: boolean;
        types?: NotificationType[];
    };

    @ApiPropertyOptional()
    @IsOptional()
    inApp?: {
        enabled: boolean;
        types?: NotificationType[];
    };
}

export class MarkNotificationAsReadDto {
    @ApiProperty()
    @IsUUID()
    notificationId: string;
}

export class GetNotificationsQueryDto {
    @ApiPropertyOptional({ enum: NotificationStatus })
    @IsEnum(NotificationStatus)
    @IsOptional()
    status?: NotificationStatus;

    @ApiPropertyOptional({ enum: NotificationType })
    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;

    @ApiPropertyOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 20;

    @ApiPropertyOptional()
    @IsNumber()
    @Min(0)
    @IsOptional()
    offset?: number = 0;
}
