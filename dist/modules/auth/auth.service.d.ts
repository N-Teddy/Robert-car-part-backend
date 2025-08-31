import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { UserRoleEnum } from '../../common/enum/entity.enum';
import { NotificationService } from '../notification/notification.service';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from 'src/dto/request/auth';
export declare class AuthService {
    private readonly userRepository;
    private readonly passwordResetTokenRepository;
    private readonly auditLogRepository;
    private readonly jwtService;
    private readonly notificationService;
    private readonly dataSource;
    constructor(userRepository: Repository<User>, passwordResetTokenRepository: Repository<PasswordResetToken>, auditLogRepository: Repository<AuditLog>, jwtService: JwtService, notificationService: NotificationService, dataSource: DataSource);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        id: string;
        email: string;
        fullName: string;
        phoneNumber: string;
        role: UserRoleEnum;
        isFirstLogin: boolean;
        profileImage: import("../../entities/image.entity").Image;
        accessToken: string;
        refreshToken: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        fullName: string;
        phoneNumber: string;
        role: UserRoleEnum;
        isFirstLogin: boolean;
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    refreshToken(userId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        email: string;
        fullName: string;
        phoneNumber: string;
        role: UserRoleEnum;
        isFirstLogin: boolean;
        isActive: boolean;
        profileImage?: import("../../entities/image.entity").Image;
        resetTokens: PasswordResetToken[];
        notifications: import("../../entities/notification.entity").Notification[];
        auditLogs: AuditLog[];
        id: string;
        createdBy?: string | null;
        updatedBy?: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignRole(targetUserId: string, role: UserRoleEnum): Promise<{
        message: string;
    }>;
}
