import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
	UseGuards,
	Request,
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
import { UserService } from './user.service';

import {
	UpdateProfileDto,
	AssignRoleDto,
	UpdateUserDto,
	UserFilterDto,
} from '../../dto/request/user.dto';
import {
	UserResponseDto,
	UserProfileResponseDto,
	UsersListResponseDto,
} from '../../dto/response/user.dto';
import { UserRoleEnum } from '../../common/enum/entity.enum';
import { Roles } from 'src/common/decorator/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@ApiOperation({ summary: 'Get current user profile' })
	@ApiResponse({ status: 200, type: UserProfileResponseDto })
	async getProfile(@Request() req): Promise<UserProfileResponseDto> {
		return await this.userService.getProfile(req.user.id);
	}

	@Put('profile')
	@ApiOperation({ summary: 'Update current user profile' })
	@ApiResponse({ status: 200, type: UserProfileResponseDto })
	async updateProfile(
		@Request() req,
		@Body() dto: UpdateProfileDto
	): Promise<UserProfileResponseDto> {
		return await this.userService.updateProfile(req.user.id, dto);
	}

	@Post('assign-role')
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
	@ApiOperation({ summary: 'Assign role to user' })
	@ApiResponse({ status: 200, type: UserResponseDto })
	async assignRole(
		@Request() req,
		@Body() dto: AssignRoleDto
	): Promise<UserResponseDto> {
		return await this.userService.assignRole(req.user.id, dto);
	}

	@Get()
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
	@ApiOperation({ summary: 'Get all users with filters' })
	@ApiResponse({ status: 200, type: UsersListResponseDto })
	async getAllUsers(
		@Query() filter: UserFilterDto
	): Promise<UsersListResponseDto> {
		return await this.userService.getAllUsers(filter);
	}

	@Get('without-role')
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
	@ApiOperation({ summary: 'Get users without assigned role' })
	@ApiResponse({ status: 200, type: [UserResponseDto] })
	async getUsersWithoutRole(): Promise<UserResponseDto[]> {
		return await this.userService.getUsersWithoutRole();
	}

	@Get(':id')
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
	@ApiOperation({ summary: 'Get user by ID' })
	@ApiResponse({ status: 200, type: UserResponseDto })
	async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
		return await this.userService.getUserById(id);
	}

	@Put(':id')
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
	@ApiOperation({ summary: 'Update user by ID' })
	@ApiResponse({ status: 200, type: UserResponseDto })
	async updateUser(
		@Request() req,
		@Param('id') id: string,
		@Body() dto: UpdateUserDto
	): Promise<UserResponseDto> {
		return await this.userService.updateUser(req.user.id, id, dto);
	}

	@Delete(':id')
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
	@ApiOperation({ summary: 'Delete user by ID' })
	async deleteUser(@Request() req, @Param('id') id: string): Promise<any> {
		return await this.userService.deleteUser(req.user.id, id);
	}
}
