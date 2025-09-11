import { UserRoleEnum } from '../../common/enum/entity.enum';
export declare class UserAuthInfo {
    id: string;
    email: string;
    fullName: string;
    role: UserRoleEnum;
    isActive: boolean;
    phoneNumber?: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    user: UserAuthInfo;
}
export declare class MessageResponseDto {
    message: string;
    success?: boolean;
}
export declare class TokenValidationResponseDto {
    valid: boolean;
    userId?: string;
    email?: string;
}
