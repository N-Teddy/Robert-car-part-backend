import { IsEnum, IsString, IsOptional, IsArray, IsObject, IsBoolean, IsUUID, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationEnum, NotificationAudienceEnum, NotificationChannelEnum } from '../../common/enum/notification.enum';

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
    description: 'Target audience for the notification'
  })
  @IsEnum(NotificationAudienceEnum)
  audience: NotificationAudienceEnum;

  @ApiPropertyOptional({ 
    type: [String],
    description: 'Specific user IDs (used when audience is SPECIFIC_USER)'
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  userIds?: string[];

  @ApiPropertyOptional({ 
    enum: NotificationChannelEnum,
    default: NotificationChannelEnum.BOTH
  })
  @IsEnum(NotificationChannelEnum)
  @IsOptional()
  channel?: NotificationChannelEnum = NotificationChannelEnum.BOTH;

  @ApiPropertyOptional({ 
    description: 'Custom email template name (optional)'
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
    description: 'Notification IDs to mark as read'
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
}
