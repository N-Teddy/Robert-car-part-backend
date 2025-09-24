import {
	Controller,
	Get,
	Post,
	Put,
	Body,
	Query,
	UseGuards,
	Request,
	Param,
	Delete,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationService } from './notification.service';
import {
	SendNotificationDto,
	BatchSendNotificationDto,
	MarkAsReadDto,
	NotificationFilterDto,
	NotificationListResponseDto,
} from '../../dto/request/notification.dto';
import {
	NotificationResponseDto,
	SendNotificationResultDto,
	BatchSendResultDto,
} from '../../dto/response/notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Post('send')
	// @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER)
	@ApiOperation({ summary: 'Send notification to users' })
	@ApiResponse({ status: 200, type: SendNotificationResultDto })
	async sendNotification(
		@Body() dto: SendNotificationDto
	): Promise<SendNotificationResultDto> {
		return this.notificationService.sendNotification(dto);
	}

	@Post('batch-send')
	// @Roles(UserRoleEnum.ADMIN)
	@ApiOperation({ summary: 'Send multiple notifications in batch' })
	@ApiResponse({ status: 200, type: BatchSendResultDto })
	async batchSendNotifications(
		@Body() dto: BatchSendNotificationDto
	): Promise<BatchSendResultDto> {
		return this.notificationService.batchSendNotifications(dto);
	}

	@Put('mark-as-read')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Mark notifications as read' })
	async markAsRead(
		@Body() dto: MarkAsReadDto,
		@Request() req
	): Promise<void> {
		return this.notificationService.markAsRead(dto, req.user.id);
	}

	@Get()
	@ApiOperation({ summary: 'Get notifications with filters' })
	@ApiResponse({ status: 200, type: [NotificationResponseDto] })
	async getNotifications(
		@Query() filter: NotificationFilterDto
	): Promise<NotificationListResponseDto> {
		return this.notificationService.getNotifications(filter);
	}

	@Get('unread-count')
	@ApiOperation({ summary: 'Get unread notifications count' })
	async getUnreadCount(@Request() req): Promise<{ count: number }> {
		const count = await this.notificationService.getUnreadCount(
			req.user.id
		);
		return { count };
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get notification by ID' })
	@ApiResponse({ status: 200, type: NotificationResponseDto })
	async getNotificationById(
		@Param('id') id: string,
		@Request() req
	): Promise<NotificationResponseDto> {
		const notification = await this.notificationService.getNotificationById(
			id,
			req.user.id
		);
		return notification;
	}

	@Delete('cleanup')
	// @Roles(UserRoleEnum.ADMIN)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete old read notifications' })
	async cleanupOldNotifications(
		@Query('daysToKeep') daysToKeep?: number
	): Promise<{ deleted: number }> {
		const deleted = await this.notificationService.deleteOldNotifications(
			daysToKeep || 30
		);
		return { deleted };
	}
}
