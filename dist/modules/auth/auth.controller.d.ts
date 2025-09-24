import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from '../../dto/request/auth.dto';
import { AuthResponseDto, MessageResponseDto } from '../../dto/response/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto>;
    forgotPassword(dto: ForgotPasswordDto): Promise<MessageResponseDto>;
    resetPassword(dto: ResetPasswordDto): Promise<MessageResponseDto>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<MessageResponseDto>;
    logout(req: any): Promise<MessageResponseDto>;
    getCurrentUser(req: any): Promise<any>;
}
