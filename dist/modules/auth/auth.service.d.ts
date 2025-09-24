import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import { NotificationService } from '../notification/notification.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from '../../dto/request/auth.dto';
import { AuthResponseDto, MessageResponseDto } from '../../dto/response/auth.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly passwordResetTokenRepository;
    private readonly jwtService;
    private readonly configService;
    private readonly notificationService;
    private readonly logger;
    constructor(userRepository: Repository<User>, passwordResetTokenRepository: Repository<PasswordResetToken>, jwtService: JwtService, configService: ConfigService, notificationService: NotificationService);
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto>;
    forgotPassword(dto: ForgotPasswordDto): Promise<MessageResponseDto>;
    resetPassword(dto: ResetPasswordDto): Promise<MessageResponseDto>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<MessageResponseDto>;
    validateUser(email: string, password: string): Promise<User | null>;
    logout(userId: string): Promise<MessageResponseDto>;
    private generateTokens;
}
