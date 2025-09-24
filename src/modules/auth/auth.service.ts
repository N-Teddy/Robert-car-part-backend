import {
	Injectable,
	UnauthorizedException,
	BadRequestException,
	NotFoundException,
	Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/user.entity';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import { UserRoleEnum } from '../../common/enum/entity.enum';
import { NotificationService } from '../notification/notification.service';
import {
	NotificationEnum,
	NotificationAudienceEnum,
	NotificationChannelEnum,
} from '../../common/enum/notification.enum';
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

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(PasswordResetToken)
		private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly notificationService: NotificationService
	) {}

	async register(dto: RegisterDto): Promise<AuthResponseDto> {
		try {
			// Check if user already exists
			const existingUser = await this.userRepository.findOne({
				where: { email: dto.email },
			});

			if (existingUser) {
				throw new BadRequestException(
					'User with this email already exists'
				);
			}

			// Hash password
			const hashedPassword = await bcrypt.hash(
				dto.password,
				this.configService.get<number>('auth.saltRounds')
			);

			// Create user with UNKNOWN role
			const user = this.userRepository.create({
				email: dto.email,
				password: hashedPassword,
				fullName: dto.fullName,
				phoneNumber: dto.phoneNumber,
				role: UserRoleEnum.UNKNOWN,
				isActive: true,
			});

			const savedUser = await this.userRepository.save(user);

			// Send registration confirmation email to user
			await this.notificationService.sendNotification({
				type: NotificationEnum.WELCOME,
				title: 'Welcome to Car Parts Shop',
				message: `Welcome ${savedUser.fullName}! Your account has been created successfully. Please wait for an administrator to assign you a role.`,
				audience: NotificationAudienceEnum.SPECIFIC_USER,
				userIds: [savedUser.id],
				channel: NotificationChannelEnum.EMAIL,
				emailTemplate: 'welcome-pending-role', // Assuming you have a welcome email template
				metadata: {
					userId: savedUser.id,
					userEmail: savedUser.email,
					userName: savedUser.fullName,
					// TODO: add login url
				},
			});

			// Notify admins about new user registration
			await this.notificationService.sendNotification({
				type: NotificationEnum.SYSTEM_UPDATE,
				title: 'New User Registration',
				message: `A new user ${savedUser.fullName} (${savedUser.email}) has registered and needs role assignment.`,
				audience: NotificationAudienceEnum.ADMIN,
				channel: NotificationChannelEnum.BOTH,
				emailTemplate: 'notify-admin-new-user', // Assuming you have an admin notification template
				metadata: {
					newUserId: savedUser.id,
					newUserEmail: savedUser.email,
					newUserName: savedUser.fullName,
					createdAt: savedUser.createdAt,
					phone: savedUser.phoneNumber,
					// TODO: add admin panel url
				},
			});

			// Generate tokens
			const tokens = await this.generateTokens(savedUser);

			return {
				...tokens,
				user: {
					id: savedUser.id,
					email: savedUser.email,
					fullName: savedUser.fullName,
					role: savedUser.role,
					isActive: savedUser.isActive,
					phoneNumber: savedUser.phoneNumber,
				},
			};
		} catch (error) {
			this.logger.error('Registration failed', error);
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException('Registration failed');
		}
	}

	async login(dto: LoginDto): Promise<AuthResponseDto> {
		try {
			const user = await this.userRepository.findOne({
				where: { email: dto.email },
			});

			if (!user) {
				throw new UnauthorizedException('Invalid credentials');
			}

			const isPasswordValid = await bcrypt.compare(
				dto.password,
				user.password
			);
			if (!isPasswordValid) {
				throw new UnauthorizedException('Invalid credentials');
			}

			if (!user.isActive) {
				throw new UnauthorizedException('Account is deactivated');
			}

			// Update last login
			// user.lastLogin = new Date();
			await this.userRepository.save(user);

			const tokens = await this.generateTokens(user);

			return {
				...tokens,
				user: {
					id: user.id,
					email: user.email,
					fullName: user.fullName,
					role: user.role,
					isActive: user.isActive,
					phoneNumber: user.phoneNumber,
				},
			};
		} catch (error) {
			this.logger.error('Login failed', error);
			if (error instanceof UnauthorizedException) {
				throw error;
			}
			throw new UnauthorizedException('Login failed');
		}
	}

	async refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto> {
		try {
			const payload = await this.jwtService.verifyAsync(
				dto.refreshToken,
				{
					secret: this.configService.get<string>(
						'JWT_REFRESH_SECRET'
					),
				}
			);

			const user = await this.userRepository.findOne({
				where: { id: payload.sub },
			});

			if (!user || !user.isActive) {
				throw new UnauthorizedException('Invalid refresh token');
			}

			const tokens = await this.generateTokens(user);

			return {
				...tokens,
				user: {
					id: user.id,
					email: user.email,
					fullName: user.fullName,
					role: user.role,
					isActive: user.isActive,
					phoneNumber: user.phoneNumber,
				},
			};
		} catch (error) {
			this.logger.error('Token refresh failed', error);
			throw new UnauthorizedException('Invalid refresh token');
		}
	}

	async forgotPassword(dto: ForgotPasswordDto): Promise<MessageResponseDto> {
		try {
			const user = await this.userRepository.findOne({
				where: { email: dto.email },
			});

			if (!user) {
				// Don't reveal if user exists
				return {
					message:
						'If the email exists, a password reset link has been sent',
					success: true,
				};
			}

			// Generate reset token
			const resetToken = uuidv4();
			const hashedToken = await bcrypt.hash(resetToken, 10);

			// Delete existing tokens for this user
			await this.passwordResetTokenRepository.delete({
				user: { id: user.id },
			});

			// Create new reset token
			const passwordResetToken = this.passwordResetTokenRepository.create(
				{
					token: hashedToken,
					user: { id: user.id },
					expiresAt: new Date(Date.now() + 3600000), // 1 hour
				}
			);

			await this.passwordResetTokenRepository.save(passwordResetToken);

			// Send reset email
			await this.notificationService.sendNotification({
				type: NotificationEnum.PASSWORD_RESET,
				title: 'Password Reset Request',
				message:
					'You have requested to reset your password. Click the link below to reset it.',
				audience: NotificationAudienceEnum.SPECIFIC_USER,
				userIds: [user.id],
				channel: NotificationChannelEnum.EMAIL,
				emailTemplate: 'password-reset', // Assuming you have a password reset email template
				metadata: {
					name: user.fullName,
					resetLink: `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`,
				},
			});

			return {
				message:
					'If the email exists, a password reset link has been sent',
				success: true,
			};
		} catch (error) {
			this.logger.error('Forgot password failed', error);
			throw new BadRequestException(
				'Failed to process password reset request'
			);
		}
	}

	async resetPassword(dto: ResetPasswordDto): Promise<MessageResponseDto> {
		try {
			// Find all active tokens (not expired and not used yet)
			const tokens = await this.passwordResetTokenRepository.find({
				relations: ['user'],
				where: {
					expiresAt: MoreThan(new Date()),
					isUsed: false,
				},
			});

			if (!tokens.length) {
				throw new BadRequestException('Invalid or expired reset token');
			}

			// Compare with bcrypt since stored token is hashed
			let passwordResetToken: PasswordResetToken | null = null;
			for (const tokenRecord of tokens) {
				const isValid = await bcrypt.compare(
					dto.token,
					tokenRecord.token
				);
				if (isValid) {
					passwordResetToken = tokenRecord;
					break;
				}
			}

			if (!passwordResetToken) {
				throw new BadRequestException('Invalid or expired reset token');
			}

			// Update user password
			const hashedPassword = await bcrypt.hash(
				dto.newPassword,
				this.configService.get<number>('auth.saltRounds')
			);

			await this.userRepository.update(passwordResetToken.user.id, {
				password: hashedPassword,
			});

			// Mark token as used (instead of deleting it for audit trail)
			passwordResetToken.isUsed = true;
			await this.passwordResetTokenRepository.save(passwordResetToken);

			// Send confirmation email
			await this.notificationService.sendNotification({
				type: NotificationEnum.PASSWORD_CHANGED,
				title: 'Password Changed Successfully',
				message: 'Your password has been changed successfully.',
				audience: NotificationAudienceEnum.SPECIFIC_USER,
				userIds: [passwordResetToken.user.id],
				channel: NotificationChannelEnum.EMAIL,
				emailTemplate: 'password-changed-confirm',
			});

			return {
				message: 'Password reset successfully',
				success: true,
			};
		} catch (error) {
			this.logger.error('Password reset failed', error);
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException('Failed to reset password');
		}
	}

	async changePassword(
		userId: string,
		dto: ChangePasswordDto
	): Promise<MessageResponseDto> {
		try {
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});

			if (!user) {
				throw new NotFoundException('User not found');
			}

			// Verify current password
			const isPasswordValid = await bcrypt.compare(
				dto.currentPassword,
				user.password
			);
			if (!isPasswordValid) {
				throw new BadRequestException('Current password is incorrect');
			}

			// Hash and update new password
			const hashedPassword = await bcrypt.hash(
				dto.newPassword,
				this.configService.get<number>('auth.saltRounds')
			);
			await this.userRepository.update(userId, {
				password: hashedPassword,
			});

			// Send notification
			await this.notificationService.sendNotification({
				type: NotificationEnum.PASSWORD_CHANGED,
				title: 'Password Changed',
				message: 'Your password has been changed successfully.',
				audience: NotificationAudienceEnum.SPECIFIC_USER,
				userIds: [userId],
				channel: NotificationChannelEnum.WEBSOCKET,
			});

			return {
				message: 'Password changed successfully',
				success: true,
			};
		} catch (error) {
			this.logger.error('Change password failed', error);
			if (
				error instanceof BadRequestException ||
				error instanceof NotFoundException
			) {
				throw error;
			}
			throw new BadRequestException('Failed to change password');
		}
	}

	async validateUser(email: string, password: string): Promise<User | null> {
		try {
			const user = await this.userRepository.findOne({
				where: { email },
			});

			if (user && (await bcrypt.compare(password, user.password))) {
				return user;
			}

			return null;
		} catch (error) {
			this.logger.error('User validation failed', error);
			return null;
		}
	}

	async logout(userId: string): Promise<MessageResponseDto> {
		try {
			// You can implement token blacklisting here if needed
			// For now, just return success as JWT is stateless

			return {
				message: 'Logged out successfully',
				success: true,
			};
		} catch (error) {
			this.logger.error('Logout failed', error);
			throw new BadRequestException('Failed to logout');
		}
	}

	private async generateTokens(user: User) {
		const payload = {
			sub: user.id,
			email: user.email,
			role: user.role,
		};

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload),
			this.jwtService.signAsync(payload, {
				secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
				expiresIn: this.configService.get<string>(
					'JWT_REFRESH_EXPIRES_IN'
				),
			}),
		]);

		return {
			accessToken,
			refreshToken,
			expiresIn: 86400, // 24 hours in seconds
			tokenType: 'Bearer',
		};
	}
}
