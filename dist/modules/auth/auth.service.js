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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const user_entity_1 = require("../../entities/user.entity");
const password_reset_token_entity_1 = require("../../entities/password-reset-token.entity");
const audit_log_entity_1 = require("../../entities/audit-log.entity");
const entity_enum_1 = require("../../common/enum/entity.enum");
const notification_service_1 = require("../notification/notification.service");
let AuthService = class AuthService {
    constructor(userRepository, passwordResetTokenRepository, auditLogRepository, jwtService, notificationService, dataSource) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.auditLogRepository = auditLogRepository;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
        this.dataSource = dataSource;
    }
    async validateUser(email, password) {
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
        }
        catch (err) {
            throw new common_1.InternalServerErrorException('Failed to validate user');
        }
    }
    async login(loginDto) {
        try {
            const { email, password } = loginDto;
            const user = await this.userRepository.findOne({
                where: { email },
                relations: ['profileImage'],
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            await this.createAuditLog(user.id, entity_enum_1.AuditActionEnum.LOGIN, 'User logged in');
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
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException || err instanceof common_1.BadRequestException || err instanceof common_1.NotFoundException) {
                throw err;
            }
            throw new common_1.InternalServerErrorException('Failed to login');
        }
    }
    async register(registerDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { email, password, fullName, phoneNumber } = registerDto;
            const existingUser = await queryRunner.manager.findOne(user_entity_1.User, { where: { email } });
            if (existingUser) {
                throw new common_1.BadRequestException('User with this email already exists');
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = queryRunner.manager.create(user_entity_1.User, {
                email,
                password: hashedPassword,
                fullName,
                phoneNumber,
                role: entity_enum_1.UserRoleEnum.UNKNOWN,
                isFirstLogin: true,
            });
            const savedUser = await queryRunner.manager.save(user);
            await this.createAuditLog(savedUser.id, entity_enum_1.AuditActionEnum.CREATE, 'User registered');
            const payload = {
                sub: savedUser.id,
                email: savedUser.email,
                role: savedUser.role,
                fullName: savedUser.fullName,
            };
            const accessToken = this.jwtService.sign(payload, {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
            });
            const refreshToken = this.jwtService.sign(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            });
            await queryRunner.commitTransaction();
            await this.notificationService.notifyAdminsOnNewUser(savedUser);
            const welcomeHtml = this.notificationService.renderTemplate('welcome-pending-role', {
                name: savedUser.fullName || 'there'
            });
            await this.notificationService.sendEmail({
                to: savedUser.email,
                subject: 'Welcome - Pending Role Assignment',
                html: welcomeHtml,
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
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            if (err instanceof common_1.BadRequestException)
                throw err;
            throw new common_1.InternalServerErrorException('Failed to register');
        }
        finally {
            await queryRunner.release();
        }
    }
    async forgotPassword(forgotPasswordDto) {
        try {
            const { email } = forgotPasswordDto;
            const user = await this.userRepository.findOne({
                where: { email },
            });
            if (!user) {
                return { message: 'If the email exists, a password reset link has been sent.' };
            }
            const resetToken = (0, uuid_1.v4)();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);
            let resetTokenEntity = await this.passwordResetTokenRepository.findOne({
                where: { user: { id: user.id } },
            });
            if (resetTokenEntity) {
                resetTokenEntity.token = resetToken;
                resetTokenEntity.expiresAt = expiresAt;
            }
            else {
                resetTokenEntity = this.passwordResetTokenRepository.create({
                    user,
                    token: resetToken,
                    expiresAt,
                });
            }
            await this.passwordResetTokenRepository.save(resetTokenEntity);
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            const html = this.notificationService.renderTemplate('password-reset', { resetLink });
            await this.notificationService.sendEmail({
                to: user.email,
                subject: 'Password Reset Request',
                html,
            });
            return { message: 'If the email exists, a password reset link has been sent.' };
        }
        catch (err) {
            throw new common_1.InternalServerErrorException('Failed to process forgot password');
        }
    }
    async resetPassword(resetPasswordDto) {
        try {
            const { token, newPassword } = resetPasswordDto;
            const resetTokenEntity = await this.passwordResetTokenRepository.findOne({
                where: { token },
                relations: ['user'],
            });
            if (!resetTokenEntity) {
                throw new common_1.BadRequestException('Invalid reset token');
            }
            if (resetTokenEntity.expiresAt < new Date()) {
                throw new common_1.BadRequestException('Reset token has expired');
            }
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            const user = resetTokenEntity.user;
            user.password = hashedPassword;
            user.isFirstLogin = false;
            await this.userRepository.save(user);
            await this.passwordResetTokenRepository.remove(resetTokenEntity);
            await this.createAuditLog(user.id, entity_enum_1.AuditActionEnum.UPDATE, 'Password reset');
            const resetConfirmHtml = this.notificationService.renderTemplate('password-reset-confirm', {});
            await this.notificationService.sendEmail({
                to: user.email,
                subject: 'Your password has been reset',
                html: resetConfirmHtml,
            });
            return { message: 'Password has been reset successfully' };
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException) {
                throw err;
            }
            throw new common_1.InternalServerErrorException('Failed to reset password');
        }
    }
    async changePassword(userId, changePasswordDto) {
        try {
            const { currentPassword, newPassword } = changePasswordDto;
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new common_1.BadRequestException('Current password is incorrect');
            }
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, user.password);
            user.password = hashedPassword;
            user.isFirstLogin = false;
            await this.userRepository.save(user);
            await this.createAuditLog(userId, entity_enum_1.AuditActionEnum.UPDATE, 'Password changed');
            const changeConfirmHtml = this.notificationService.renderTemplate('password-change-confirm', {});
            await this.notificationService.sendEmail({
                to: user.email,
                subject: 'Your password has been changed',
                html: changeConfirmHtml,
            });
            return { message: 'Password changed successfully' };
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException || err instanceof common_1.NotFoundException) {
                throw err;
            }
            throw new common_1.InternalServerErrorException('Failed to change password');
        }
    }
    async refreshToken(userId) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['profileImage'],
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
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
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException) {
                throw err;
            }
            throw new common_1.InternalServerErrorException('Failed to refresh token');
        }
    }
    async logout(userId) {
        try {
            await this.createAuditLog(userId, entity_enum_1.AuditActionEnum.LOGOUT, 'User logged out');
            return { message: 'Logged out successfully' };
        }
        catch (err) {
            throw new common_1.InternalServerErrorException('Failed to logout');
        }
    }
    async getProfile(userId) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['profileImage'],
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const { password, ...result } = user;
            return result;
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException) {
                throw err;
            }
            throw new common_1.InternalServerErrorException('Failed to get profile');
        }
    }
    async assignRole(targetUserId, role) {
        if (!Object.values(entity_enum_1.UserRoleEnum).includes(role) || role === entity_enum_1.UserRoleEnum.UNKNOWN) {
            throw new common_1.BadRequestException('Invalid role');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager.findOne(user_entity_1.User, { where: { id: targetUserId } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            user.role = role;
            user.isFirstLogin = false;
            await queryRunner.manager.save(user);
            await this.createAuditLog(targetUserId, entity_enum_1.AuditActionEnum.UPDATE, `Role assigned: ${role}`);
            const roleHtml = this.notificationService.renderTemplate('role-assigned', { role });
            await this.notificationService.sendEmail({
                to: user.email,
                subject: 'Your role has been updated',
                html: roleHtml,
            });
            await queryRunner.commitTransaction();
            return { message: 'Role updated successfully' };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async createAuditLog(userId, action, description) {
        const auditLog = this.auditLogRepository.create({
            createdBy: userId,
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(password_reset_token_entity_1.PasswordResetToken)),
    __param(2, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        notification_service_1.NotificationService,
        typeorm_2.DataSource])
], AuthService);
//# sourceMappingURL=auth.service.js.map