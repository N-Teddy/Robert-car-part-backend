"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const user_entity_1 = require("../../entities/user.entity");
const password_reset_token_entity_1 = require("../../entities/password-reset-token.entity");
const entity_enum_1 = require("../../common/enum/entity.enum");
const notification_service_1 = require("../notification/notification.service");
const notification_enum_1 = require("../../common/enum/notification.enum");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepository, passwordResetTokenRepository, jwtService, configService, notificationService) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(dto) {
        try {
            const existingUser = await this.userRepository.findOne({
                where: { email: dto.email },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('User with this email already exists');
            }
            const hashedPassword = await bcrypt.hash(dto.password, this.configService.get('auth.saltRounds'));
            const user = this.userRepository.create({
                email: dto.email,
                password: hashedPassword,
                fullName: dto.fullName,
                phoneNumber: dto.phoneNumber,
                role: entity_enum_1.UserRoleEnum.UNKNOWN,
                isActive: true,
            });
            const savedUser = await this.userRepository.save(user);
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.WELCOME,
                title: 'Welcome to Car Parts Shop',
                message: `Welcome ${savedUser.fullName}! Your account has been created successfully. Please wait for an administrator to assign you a role.`,
                audience: notification_enum_1.NotificationAudienceEnum.SPECIFIC_USER,
                userIds: [savedUser.id],
                channel: notification_enum_1.NotificationChannelEnum.EMAIL,
                emailTemplate: 'welcome-pending-role',
                metadata: {
                    userId: savedUser.id,
                    userEmail: savedUser.email,
                    userName: savedUser.fullName,
                },
            });
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.SYSTEM_UPDATE,
                title: 'New User Registration',
                message: `A new user ${savedUser.fullName} (${savedUser.email}) has registered and needs role assignment.`,
                audience: notification_enum_1.NotificationAudienceEnum.ADMIN,
                channel: notification_enum_1.NotificationChannelEnum.BOTH,
                emailTemplate: 'notify-admin-new-user',
                metadata: {
                    newUserId: savedUser.id,
                    newUserEmail: savedUser.email,
                    newUserName: savedUser.fullName,
                    createdAt: savedUser.createdAt,
                    phone: savedUser.phoneNumber,
                },
            });
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
        }
        catch (error) {
            this.logger.error('Registration failed', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Registration failed');
        }
    }
    async login(dto) {
        try {
            const user = await this.userRepository.findOne({
                where: { email: dto.email },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isPasswordValid = await bcrypt.compare(dto.password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            if (!user.isActive) {
                throw new common_1.UnauthorizedException('Account is deactivated');
            }
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
        }
        catch (error) {
            this.logger.error('Login failed', error);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Login failed');
        }
    }
    async refreshToken(dto) {
        try {
            const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.userRepository.findOne({
                where: { id: payload.sub },
            });
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
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
        }
        catch (error) {
            this.logger.error('Token refresh failed', error);
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async forgotPassword(dto) {
        try {
            const user = await this.userRepository.findOne({
                where: { email: dto.email },
            });
            if (!user) {
                return {
                    message: 'If the email exists, a password reset link has been sent',
                    success: true,
                };
            }
            const resetToken = (0, uuid_1.v4)();
            const hashedToken = await bcrypt.hash(resetToken, 10);
            await this.passwordResetTokenRepository.delete({
                user: { id: user.id },
            });
            const passwordResetToken = this.passwordResetTokenRepository.create({
                token: hashedToken,
                user: { id: user.id },
                expiresAt: new Date(Date.now() + 3600000),
            });
            await this.passwordResetTokenRepository.save(passwordResetToken);
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.PASSWORD_RESET,
                title: 'Password Reset Request',
                message: 'You have requested to reset your password. Click the link below to reset it.',
                audience: notification_enum_1.NotificationAudienceEnum.SPECIFIC_USER,
                userIds: [user.id],
                channel: notification_enum_1.NotificationChannelEnum.EMAIL,
                emailTemplate: 'password-reset',
                metadata: {
                    name: user.fullName,
                    resetLink: `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`,
                },
            });
            return {
                message: 'If the email exists, a password reset link has been sent',
                success: true,
            };
        }
        catch (error) {
            this.logger.error('Forgot password failed', error);
            throw new common_1.BadRequestException('Failed to process password reset request');
        }
    }
    async resetPassword(dto) {
        try {
            const tokens = await this.passwordResetTokenRepository.find({
                relations: ['user'],
                where: {
                    expiresAt: (0, typeorm_2.MoreThan)(new Date()),
                    isUsed: false,
                },
            });
            if (!tokens.length) {
                throw new common_1.BadRequestException('Invalid or expired reset token');
            }
            let passwordResetToken = null;
            for (const tokenRecord of tokens) {
                const isValid = await bcrypt.compare(dto.token, tokenRecord.token);
                if (isValid) {
                    passwordResetToken = tokenRecord;
                    break;
                }
            }
            if (!passwordResetToken) {
                throw new common_1.BadRequestException('Invalid or expired reset token');
            }
            const hashedPassword = await bcrypt.hash(dto.newPassword, this.configService.get('auth.saltRounds'));
            await this.userRepository.update(passwordResetToken.user.id, {
                password: hashedPassword,
            });
            passwordResetToken.isUsed = true;
            await this.passwordResetTokenRepository.save(passwordResetToken);
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.PASSWORD_CHANGED,
                title: 'Password Changed Successfully',
                message: 'Your password has been changed successfully.',
                audience: notification_enum_1.NotificationAudienceEnum.SPECIFIC_USER,
                userIds: [passwordResetToken.user.id],
                channel: notification_enum_1.NotificationChannelEnum.EMAIL,
                emailTemplate: 'password-changed-confirm',
            });
            return {
                message: 'Password reset successfully',
                success: true,
            };
        }
        catch (error) {
            this.logger.error('Password reset failed', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to reset password');
        }
    }
    async changePassword(userId, dto) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
            if (!isPasswordValid) {
                throw new common_1.BadRequestException('Current password is incorrect');
            }
            const hashedPassword = await bcrypt.hash(dto.newPassword, this.configService.get('auth.saltRounds'));
            await this.userRepository.update(userId, {
                password: hashedPassword,
            });
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.PASSWORD_CHANGED,
                title: 'Password Changed',
                message: 'Your password has been changed successfully.',
                audience: notification_enum_1.NotificationAudienceEnum.SPECIFIC_USER,
                userIds: [userId],
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
            });
            return {
                message: 'Password changed successfully',
                success: true,
            };
        }
        catch (error) {
            this.logger.error('Change password failed', error);
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to change password');
        }
    }
    async validateUser(email, password) {
        try {
            const user = await this.userRepository.findOne({
                where: { email },
            });
            if (user && (await bcrypt.compare(password, user.password))) {
                return user;
            }
            return null;
        }
        catch (error) {
            this.logger.error('User validation failed', error);
            return null;
        }
    }
    async logout(userId) {
        try {
            return {
                message: 'Logged out successfully',
                success: true,
            };
        }
        catch (error) {
            this.logger.error('Logout failed', error);
            throw new common_1.BadRequestException('Failed to logout');
        }
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
            }),
        ]);
        return {
            accessToken,
            refreshToken,
            expiresIn: 86400,
            tokenType: 'Bearer',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(password_reset_token_entity_1.PasswordResetToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        notification_service_1.NotificationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map