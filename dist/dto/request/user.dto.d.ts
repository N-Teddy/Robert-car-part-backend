import { UserRoleEnum } from '../../common/enum/entity.enum';
export declare class UpdateProfileDto {
    fullName?: string;
    phoneNumber?: string;
}
export declare class AssignRoleDto {
    userId: string;
    role: UserRoleEnum;
}
export declare class UpdateUserDto {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    role?: UserRoleEnum;
    isActive?: boolean;
}
export declare class UserFilterDto {
    role?: UserRoleEnum;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}
