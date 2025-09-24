import { UserRoleEnum } from 'src/common/enum/entity.enum';
export interface SampleUser {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role: UserRoleEnum;
    isFirstLogin?: boolean;
    isActive?: boolean;
}
export declare const SAMPLE_USERS: SampleUser[];
