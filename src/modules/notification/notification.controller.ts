import {
	Controller,
	Get,
	UseGuards,
	Request,
	Param,
	Patch,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Get()
	@ApiOperation({ summary: 'List current user notifications' })
	@ApiResponse({ status: 200 })
	async list(@Request() req) {
		try {
			return await this.notificationService.getUserNotifications(
				req.user.id
			);
		} catch (err) {
			throw err;
		}
	}

	@Get('unread-count')
	@ApiOperation({ summary: 'Get count of unread notifications' })
	@ApiResponse({ status: 200 })
	async count(@Request() req) {
		try {
			return await this.notificationService.getUnreadCount(req.user.id);
		} catch (err) {
			throw err;
		}
	}

	@Patch(':id/read')
	@ApiOperation({ summary: 'Mark a notification as read' })
	@ApiResponse({ status: 200, description: 'Notification marked as read' })
	async markRead(@Param('id') id: string, @Request() req) {
		try {
			return await this.notificationService.markAsRead(id, req.user.id);
		} catch (err) {
			throw err;
		}
	}
}
