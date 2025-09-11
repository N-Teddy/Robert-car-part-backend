import { UserRoleEnum } from '../../common/enum/entity.enum';
export declare class UserResponseDto {
    id: string;
    email: string;
    fullName: string;
    role: UserRoleEnum;
    isActive: boolean;
    phoneNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UserProfileResponseDto {
    id: string;
    email: string;
    fullName: string;
    role: UserRoleEnum;
    phoneNumber?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UsersListResponseDto {
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
}
