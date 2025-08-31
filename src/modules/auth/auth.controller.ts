import {
	Controller,
	Post,
	Get,
	Body,
	UseGuards,
	Request,
	HttpCode,
	HttpStatus,
	Patch,
	Param,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRoleEnum } from '../../common/enum/entity.enum';
import { NonUnknownRoleGuard } from './guards/non-unknown-role.guard';
import {
	ChangePasswordDto,
	ForgotPasswordDto,
	LoginDto,
	RegisterDto,
	ResetPasswordDto,
} from 'src/dto/request/auth';
import { AssignRoleDto } from 'src/dto/request/user';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@ApiOperation({ summary: 'Register a new user' })
	@ApiResponse({ status: 201, description: 'User registered successfully' })
	@ApiResponse({
		status: 400,
		description: 'Bad request - User already exists',
	})
	async register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}

	@Post('login')
	@UseGuards(LocalAuthGuard)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Login user' })
	@ApiResponse({ status: 200, description: 'Login successful' })
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid credentials',
	})
	async login(@Request() req, @Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@Post('forgot-password')
	@UseGuards(JwtAuthGuard, NonUnknownRoleGuard)
	@ApiBearerAuth()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Request password reset' })
	@ApiResponse({ status: 200, description: 'Password reset email sent' })
	async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
		return this.authService.forgotPassword(forgotPasswordDto);
	}

	@Post('reset-password')
	@UseGuards(JwtAuthGuard, NonUnknownRoleGuard)
	@ApiBearerAuth()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Reset password with token' })
	@ApiResponse({ status: 200, description: 'Password reset successful' })
	@ApiResponse({
		status: 400,
		description: 'Bad request - Invalid or expired token',
	})
	async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
		return this.authService.resetPassword(resetPasswordDto);
	}

	@Post('change-password')
	@UseGuards(JwtAuthGuard, NonUnknownRoleGuard)
	@ApiBearerAuth()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Change user password' })
	@ApiResponse({ status: 200, description: 'Password changed successfully' })
	@ApiResponse({
		status: 400,
		description: 'Bad request - Current password incorrect',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async changePassword(
		@Request() req,
		@Body() changePasswordDto: ChangePasswordDto
	) {
		return this.authService.changePassword(req.user.id, changePasswordDto);
	}

	@Post('refresh')
	@UseGuards(JwtAuthGuard, NonUnknownRoleGuard)
	@ApiBearerAuth()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Refresh access token' })
	@ApiResponse({ status: 200, description: 'Token refreshed successfully' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async refreshToken(@Request() req) {
		// console.log(req.user)
		return this.authService.refreshToken(req.user.id);
	}

	@Post('logout')
	@UseGuards(JwtAuthGuard, NonUnknownRoleGuard)
	@ApiBearerAuth()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Logout user' })
	@ApiResponse({ status: 200, description: 'Logout successful' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async logout(@Request() req) {
		return this.authService.logout(req.user.id);
	}

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get user profile' })
	@ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 404, description: 'User not found' })
	async getProfile(@Request() req) {
		return this.authService.getProfile(req.user.id);
	}

	@Patch('users/:id/role')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@ApiBearerAuth()
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
	@ApiOperation({ summary: 'Assign role to a user' })
	@ApiResponse({ status: 200, description: 'Role updated successfully' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	async assignRole(@Param('id') id: string, @Body() body: AssignRoleDto) {
		return this.authService.assignRole(id, body.role);
	}

	@Get('test')
	@UseGuards(JwtAuthGuard, NonUnknownRoleGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Test protected route' })
	@ApiResponse({ status: 200, description: 'Access granted' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	getProtectedRoute(@Request() req) {
		return {
			message: 'This is a protected route',
			user: req.user,
		};
	}
}
