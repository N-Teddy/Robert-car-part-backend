import { UserRoleEnum } from 'src/common/enum/entity.enum';
export declare class AssignRoleDto {
    role: UserRoleEnum;
}
export declare class CreateStaffDto {
    email: string;
    fullName: string;
    phoneNumber?: string;
    role: UserRoleEnum.ADMIN | UserRoleEnum.MANAGER | UserRoleEnum.DEV;
}
export declare class UpdateStaffDto {
    fullName?: string;
    phoneNumber?: string;
    role?: UserRoleEnum.ADMIN | UserRoleEnum.MANAGER | UserRoleEnum.DEV;
}
export declare class StaffFilterDto {
    role?: UserRoleEnum.ADMIN | UserRoleEnum.MANAGER | UserRoleEnum.DEV;
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}
export declare class UpdateProfileDto {
    fullName?: string;
    phoneNumber?: string;
}
export declare class StaffStatisticsDto {
    totalStaff: number;
    activeStaff: number;
    inactiveStaff: number;
    byRole: Record<string, number>;
}
