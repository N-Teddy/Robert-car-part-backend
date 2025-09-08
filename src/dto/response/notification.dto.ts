import { ApiProperty } from '@nestjs/swagger';
import { NotificationEnum } from '../../common/enum/notification.enum';

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationEnum })
  type: NotificationEnum;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty({ required: false })
  metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  userId?: string;

  @ApiProperty()
  emailSent: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SendNotificationResultDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  totalRecipients: number;

  @ApiProperty()
  emailsSent: number;

  @ApiProperty()
  emailsFailed: number;

  @ApiProperty()
  websocketsSent: number;

  @ApiProperty({ type: [String] })
  notificationIds: string[];

  @ApiProperty({ required: false })
  errors?: string[];
}

export class BatchSendResultDto {
  @ApiProperty()
  totalBatches: number;

  @ApiProperty()
  successfulBatches: number;

  @ApiProperty()
  failedBatches: number;

  @ApiProperty({ type: [SendNotificationResultDto] })
  results: SendNotificationResultDto[];
}