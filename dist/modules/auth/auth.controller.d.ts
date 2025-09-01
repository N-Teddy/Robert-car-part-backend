import { AuthService } from './auth.service';
import { UserRoleEnum } from '../../common/enum/entity.enum';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from 'src/dto/request/auth';
import { AssignRoleDto } from 'src/dto/request/user';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    login(req: any, loginDto: LoginDto): Promise<{
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
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    refreshToken(req: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(req: any): Promise<{
        email: string;
        fullName: string;
        phoneNumber: string;
        role: UserRoleEnum;
        isFirstLogin: boolean;
        isActive: boolean;
        profileImage?: import("../../entities/image.entity").Image;
        resetTokens: import("../../entities/password-reset-token.entity").PasswordResetToken[];
        notifications: import("../../entities/notification.entity").Notification[];
        auditLogs: import("../../entities/audit-log.entity").AuditLog[];
        id: string;
        createdBy?: string | null;
        updatedBy?: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignRole(id: string, body: AssignRoleDto): Promise<{
        message: string;
    }>;
    getProtectedRoute(req: any): {
        message: string;
        user: any;
    };
}
