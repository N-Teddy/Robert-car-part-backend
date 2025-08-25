import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../../entities/user.entity';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { UserRoleEnum, AuditActionEnum } from '../../common/enum/entity.enum';
import { NotificationService } from '../notification/notification.service';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from 'src/dto/request/auth';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(PasswordResetToken)
        private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
        private readonly jwtService: JwtService,
        private readonly notificationService: NotificationService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        try {
            const user = await this.userRepository.findOne({
                where: { email },
                relations: ['profileImage'],
            });

            if (user && (await bcrypt.compare(password, user.password))) {
                const { password, ...result } = user;
                return result;
            }
            return null;
        } catch (err) {
            throw new InternalServerErrorException('Failed to validate user');
        }
    }

    async login(loginDto: LoginDto) {
        try {
            const { email, password } = loginDto;

            const user = await this.userRepository.findOne({
                where: { email },
                relations: ['profileImage'],
            });

            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }

            await this.createAuditLog(user.id, AuditActionEnum.LOGIN, 'User logged in');

            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
            };

            const accessToken = this.jwtService.sign(payload);
            const refreshToken = this.jwtService.sign(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            });

            return {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                role: user.role,
                isFirstLogin: user.isFirstLogin,
                profileImage: user.profileImage,
                accessToken,
                refreshToken,
            };
        } catch (err) {
            if (err instanceof UnauthorizedException || err instanceof BadRequestException || err instanceof NotFoundException) {
                throw err;
            }
            throw new InternalServerErrorException('Failed to login');
        }
    }

    async register(registerDto: RegisterDto) {
        try {
            const { email, password, fullName, phoneNumber } = registerDto;

            const existingUser = await this.userRepository.findOne({
                where: { email },
            });

            if (existingUser) {
                throw new BadRequestException('User with this email already exists');
            }

            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const user = this.userRepository.create({
                email,
                password: hashedPassword,
                fullName,
                phoneNumber,
                role: UserRoleEnum.UNKNOWN,
                isFirstLogin: true,
            });

            const savedUser = await this.userRepository.save(user);

            await this.createAuditLog(savedUser.id, AuditActionEnum.CREATE, 'User registered');

            await this.notificationService.notifyAdminsOnNewUser(savedUser);
            await this.notificationService.sendWelcomePendingRoleEmail(savedUser.email, savedUser.fullName);

            const payload = {
                sub: savedUser.id,
                email: savedUser.email,
                role: savedUser.role,
                fullName: savedUser.fullName,
            };

            const accessToken = this.jwtService.sign(payload);
            const refreshToken = this.jwtService.sign(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            });

            return {
                id: savedUser.id,
                email: savedUser.email,
                fullName: savedUser.fullName,
                phoneNumber: savedUser.phoneNumber,
                role: savedUser.role,
                isFirstLogin: savedUser.isFirstLogin,
                accessToken,
                refreshToken,
            };
        } catch (err) {
            if (err instanceof UnauthorizedException || err instanceof BadRequestException || err instanceof NotFoundException) {
                throw err;
            }
            throw new InternalServerErrorException('Failed to register');
        }
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        try {
            const { email } = forgotPasswordDto;

            const user = await this.userRepository.findOne({
                where: { email },
            });

            if (!user) {
                return { message: 'If the email exists, a password reset link has been sent.' };
            }

            const resetToken = uuidv4();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);

            let resetTokenEntity = await this.passwordResetTokenRepository.findOne({
                where: { user: { id: user.id } },
            });

            if (resetTokenEntity) {
                resetTokenEntity.token = resetToken;
                resetTokenEntity.expiresAt = expiresAt;
            } else {
                resetTokenEntity = this.passwordResetTokenRepository.create({
                    user,
                    token: resetToken,
                    expiresAt,
                });
            }

            await this.passwordResetTokenRepository.save(resetTokenEntity);

            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            await this.notificationService.sendPasswordResetEmail(user.email, resetLink);

            return { message: 'If the email exists, a password reset link has been sent.' };
        } catch (err) {
            throw new InternalServerErrorException('Failed to process forgot password');
        }
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        try {
            const { token, newPassword } = resetPasswordDto;

            const resetTokenEntity = await this.passwordResetTokenRepository.findOne({
                where: { token },
                relations: ['user'],
            });

            if (!resetTokenEntity) {
                throw new BadRequestException('Invalid reset token');
            }

            if (resetTokenEntity.expiresAt < new Date()) {
                throw new BadRequestException('Reset token has expired');
            }

            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            const user = resetTokenEntity.user;
            user.password = hashedPassword;
            user.isFirstLogin = false;
            await this.userRepository.save(user);

            await this.passwordResetTokenRepository.remove(resetTokenEntity);

            await this.createAuditLog(user.id, AuditActionEnum.UPDATE, 'Password reset');
            await this.notificationService.sendPasswordResetConfirmationEmail(user.email);

            return { message: 'Password has been reset successfully' };
        } catch (err) {
            if (err instanceof BadRequestException) {
                throw err;
            }
            throw new InternalServerErrorException('Failed to reset password');
        }
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
        try {
            const { currentPassword, newPassword } = changePasswordDto;

            const user = await this.userRepository.findOne({
                where: { id: userId },
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new BadRequestException('Current password is incorrect');
            }

            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, user.password);

            user.password = hashedPassword;
            user.isFirstLogin = false;
            await this.userRepository.save(user);

            await this.createAuditLog(userId, AuditActionEnum.UPDATE, 'Password changed');
            await this.notificationService.sendPasswordChangeConfirmationEmail(user.email);

            return { message: 'Password changed successfully' };
        } catch (err) {
            if (err instanceof BadRequestException || err instanceof NotFoundException) {
                throw err;
            }
            throw new InternalServerErrorException('Failed to change password');
        }
    }

    async refreshToken(userId: string) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['profileImage'],
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
            };

            const accessToken = this.jwtService.sign(payload);
            const refreshToken = this.jwtService.sign(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            });

            return {
                accessToken,
                refreshToken,
            };
        } catch (err) {
            if (err instanceof UnauthorizedException) {
                throw err;
            }
            throw new InternalServerErrorException('Failed to refresh token');
        }
    }

    async logout(userId: string) {
        try {
            await this.createAuditLog(userId, AuditActionEnum.LOGOUT, 'User logged out');
            return { message: 'Logged out successfully' };
        } catch (err) {
            throw new InternalServerErrorException('Failed to logout');
        }
    }

    async getProfile(userId: string) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['profileImage'],
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const { password, ...result } = user;
            return result;
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            throw new InternalServerErrorException('Failed to get profile');
        }
    }

    async assignRole(targetUserId: string, role: UserRoleEnum) {
        try {
            if (!Object.values(UserRoleEnum).includes(role) || role === UserRoleEnum.UNKNOWN) {
                throw new BadRequestException('Invalid role');
            }
            const user = await this.userRepository.findOne({ where: { id: targetUserId } });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            user.role = role;
            user.isFirstLogin = false;
            await this.userRepository.save(user);
            await this.createAuditLog(targetUserId, AuditActionEnum.UPDATE, `Role assigned: ${role}`);
            await this.notificationService.sendRoleAssignedEmail(user.email, role);
            return { message: 'Role updated successfully' };
        } catch (err) {
            if (err instanceof BadRequestException || err instanceof NotFoundException) {
                throw err;
            }
            throw new InternalServerErrorException('Failed to assign role');
        }
    }

    private async createAuditLog(userId: string, action: AuditActionEnum, description: string) {
        const auditLog = this.auditLogRepository.create({
            user: { id: userId },
            action,
            entity: 'User',
            details: { description },
            route: '/api/auth',
            userId,
            timestamp: new Date(),
        });

        await this.auditLogRepository.save(auditLog);
    }
}