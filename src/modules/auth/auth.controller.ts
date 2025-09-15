import {
	Controller,
	Post,
	Body,
	UseGuards,
	Request,
	HttpCode,
	HttpStatus,
	Get,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
	RegisterDto,
	LoginDto,
	RefreshTokenDto,
	ForgotPasswordDto,
	ResetPasswordDto,
	ChangePasswordDto,
} from '../../dto/request/auth.dto';
import {
	AuthResponseDto,
	MessageResponseDto,
} from '../../dto/response/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@ApiOperation({ summary: 'Register a new user' })
	@ApiResponse({ status: 201, type: AuthResponseDto })
	async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
		try {
			return await this.authService.register(dto);
		} catch (error) {
			throw error;
		}
	}

	@Post('login')
	@ApiOperation({ summary: 'Login user' })
	@ApiResponse({ status: 200, type: AuthResponseDto })
	async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
		try {
			return await this.authService.login(dto);
		} catch (error) {
			throw error;
		}
	}

	@Post('refresh')
	@ApiOperation({ summary: 'Refresh access token' })
	@ApiResponse({ status: 200, type: AuthResponseDto })
	async refreshToken(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
		try {
			return await this.authService.refreshToken(dto);
		} catch (error) {
			throw error;
		}
	}

	@Post('forgot-password')
	@ApiOperation({ summary: 'Request password reset' })
	@ApiResponse({ status: 200, type: MessageResponseDto })
	async forgotPassword(
		@Body() dto: ForgotPasswordDto
	): Promise<MessageResponseDto> {
		try {
			return await this.authService.forgotPassword(dto);
		} catch (error) {
			throw error;
		}
	}

	@Post('reset-password')
	@ApiOperation({ summary: 'Reset password with token' })
	@ApiResponse({ status: 200, type: MessageResponseDto })
	async resetPassword(
		@Body() dto: ResetPasswordDto
	): Promise<MessageResponseDto> {
		try {
			return await this.authService.resetPassword(dto);
		} catch (error) {
			throw error;
		}
	}

	@Post('change-password')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Change password for authenticated user' })
	@ApiResponse({ status: 200, type: MessageResponseDto })
	async changePassword(
		@Request() req,
		@Body() dto: ChangePasswordDto
	): Promise<MessageResponseDto> {
		try {
			return await this.authService.changePassword(req.user.id, dto);
		} catch (error) {
			throw error;
		}
	}

	@Post('logout')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Logout user' })
	@ApiResponse({ status: 200, type: MessageResponseDto })
	async logout(@Request() req): Promise<MessageResponseDto> {
		try {
			return await this.authService.logout(req.user.id);
		} catch (error) {
			throw error;
		}
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get current user info' })
	@ApiResponse({ status: 200, type: AuthResponseDto })
	async getCurrentUser(@Request() req): Promise<any> {
		try {
			return req.user;
		} catch (error) {
			throw error;
		}
	}
}
