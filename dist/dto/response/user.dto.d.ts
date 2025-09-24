import { UserRoleEnum } from '../../common/enum/entity.enum';
import { UploadedImageResponseDto } from './upload.dto';
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
    profileImage?: UploadedImageResponseDto;
}
export declare class UsersListResponseDto {
    items: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
