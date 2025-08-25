export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
