import {
	Controller,
	Get,
	Post,
	Patch,
	Body,
	Param,
	Query,
	UseGuards,
	Request,
	UnauthorizedException,
	HttpStatus,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiQuery,
	ApiParam,
	ApiBody,
	ApiUnauthorizedResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
} from '@nestjs/swagger';

import { UserRoleEnum } from '../../common/enum/entity.enum';
import { UserService } from './user.service';
import {
	CreateStaffDto,
	UpdateStaffDto,
	StaffFilterDto,
	UpdateProfileDto,
	StaffStatisticsDto,
} from '../../dto/request/user';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('staff')
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.DEV, UserRoleEnum.MANAGER)
	@ApiOperation({
		summary: 'Get all staff members',
		description:
			'Admin only endpoint to retrieve all staff members with filtering and pagination',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Staff members retrieved successfully',
		type: [User],
	})
	@ApiUnauthorizedResponse({
		description: 'Unauthorized - Invalid or missing token',
	})
	@ApiForbiddenResponse({
		description: 'Forbidden - User does not have admin role',
	})
	@ApiQuery({
		name: 'role',
		required: false,
		enum: UserRoleEnum,
		description: 'Filter by role',
	})
	@ApiQuery({
		name: 'search',
		required: false,
		description: 'Search by name or email',
	})
	@ApiQuery({
		name: 'isActive',
		required: false,
		type: Boolean,
		description: 'Filter by active status',
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
		description: 'Items per page',
	})
	async getStaff(@Query() filters: StaffFilterDto) {
		try {
			return await this.userService.findAllStaff(filters);
		} catch (error) {
			throw error;
		}
	}

	@Post('staff')
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.DEV, UserRoleEnum.MANAGER)
	@ApiOperation({
		summary: 'Create a new staff member',
		description: 'Admin only endpoint to create a new staff member',
	})
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Staff member created successfully',
		type: User,
	})
	@ApiUnauthorizedResponse({
		description: 'Unauthorized - Invalid or missing token',
	})
	@ApiForbiddenResponse({
		description: 'Forbidden - User does not have admin role',
	})
	@ApiBody({ type: CreateStaffDto })
	async createStaff(@Body() createStaffDto: CreateStaffDto) {
		try {
			return await this.userService.createStaff(createStaffDto);
		} catch (error) {
			throw error;
		}
	}

	@Patch('staff/:id')
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.DEV, UserRoleEnum.MANAGER)
	@ApiOperation({
		summary: 'Update a staff member',
		description: 'Admin only endpoint to update a staff member',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Staff member updated successfully',
		type: User,
	})
	@ApiUnauthorizedResponse({
		description: 'Unauthorized - Invalid or missing token',
	})
	@ApiForbiddenResponse({
		description: 'Forbidden - User does not have admin role',
	})
	@ApiNotFoundResponse({ description: 'Staff member not found' })
	@ApiParam({ name: 'id', description: 'Staff member ID' })
	@ApiBody({ type: UpdateStaffDto })
	async updateStaff(
		@Param('id') id: string,
		@Body() updateStaffDto: UpdateStaffDto
	) {
		try {
			return await this.userService.updateStaff(id, updateStaffDto);
		} catch (error) {
			throw error;
		}
	}

	@Patch('staff/:id/deactivate')
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.DEV, UserRoleEnum.MANAGER)
	@ApiOperation({
		summary: 'Deactivate a staff member',
		description: 'Admin only endpoint to deactivate a staff member',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Staff member deactivated successfully',
		type: User,
	})
	@ApiUnauthorizedResponse({
		description: 'Unauthorized - Invalid or missing token',
	})
	@ApiForbiddenResponse({
		description: 'Forbidden - User does not have admin role',
	})
	@ApiNotFoundResponse({ description: 'Staff member not found' })
	@ApiParam({ name: 'id', description: 'Staff member ID' })
	async deactivateStaff(@Param('id') id: string) {
		try {
			return await this.userService.deactivateStaff(id);
		} catch (error) {
			throw error;
		}
	}

	@Patch('staff/:id/activate')
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.DEV, UserRoleEnum.MANAGER)
	@ApiOperation({
		summary: 'Activate a staff member',
		description:
			'Admin only endpoint to activate a deactivated staff member',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Staff member activated successfully',
		type: User,
	})
	@ApiUnauthorizedResponse({
		description: 'Unauthorized - Invalid or missing token',
	})
	@ApiForbiddenResponse({
		description: 'Forbidden - User does not have admin role',
	})
	@ApiNotFoundResponse({ description: 'Staff member not found' })
	@ApiParam({ name: 'id', description: 'Staff member ID' })
	async activateStaff(@Param('id') id: string) {
		try {
			return await this.userService.activateStaff(id);
		} catch (error) {
			throw error;
		}
	}

	@Get('staff/statistics')
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.DEV, UserRoleEnum.MANAGER)
	@ApiOperation({
		summary: 'Get staff statistics',
		description: 'Admin only endpoint to get staff statistics',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Statistics retrieved successfully',
		type: StaffStatisticsDto,
	})
	@ApiUnauthorizedResponse({
		description: 'Unauthorized - Invalid or missing token',
	})
	@ApiForbiddenResponse({
		description: 'Forbidden - User does not have admin role',
	})
	async getStaffStatistics() {
		try {
			return await this.userService.getStaffStatistics();
		} catch (error) {
			throw error;
		}
	}

	@Get('profile')
	@ApiOperation({
		summary: 'Get user profile',
		description: 'Get the authenticated user profile',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Profile retrieved successfully',
		type: User,
	})
	@ApiUnauthorizedResponse({
		description: 'Unauthorized - Invalid or missing token',
	})
	async getProfile(@Request() req) {
		try {
			if (!req.user || !req.user.id) {
				throw new UnauthorizedException('User not authenticated');
			}
			return await this.userService.findById(req.user.id);
		} catch (error) {
			throw error;
		}
	}

	@Patch('profile')
	@ApiOperation({
		summary: 'Update user profile',
		description: 'Update the authenticated user profile',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Profile updated successfully',
		type: User,
	})
	@ApiUnauthorizedResponse({
		description: 'Unauthorized - Invalid or missing token',
	})
	@ApiBody({ type: UpdateProfileDto })
	async updateProfile(
		@Request() req,
		@Body() updateProfileDto: UpdateProfileDto
	) {
		try {
			if (!req.user || !req.user.id) {
				throw new UnauthorizedException('User not authenticated');
			}
			return await this.userService.updateProfile(
				req.user.id,
				updateProfileDto
			);
		} catch (error) {
			throw error;
		}
	}
}
