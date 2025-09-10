import { RoleEnum } from '../../common/enum/entity.enum';
export declare class UpdateProfileDto {
    fullName?: string;
    phoneNumber?: string;
}
export declare class AssignRoleDto {
    userId: string;
    role: RoleEnum;
}
export declare class UpdateUserDto {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    role?: RoleEnum;
    isActive?: boolean;
}
export declare class UserFilterDto {
    role?: RoleEnum;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
