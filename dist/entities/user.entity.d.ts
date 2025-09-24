import { PasswordResetToken } from './password-reset-token.entity';
import { Notification } from './notification.entity';
import { Image } from './image.entity';
import { UserRoleEnum } from 'src/common/enum/entity.enum';
import { BaseEntity } from './base.entity';
import { AuditLog } from './audit-log.entity';
export declare class User extends BaseEntity {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role: UserRoleEnum;
    isFirstLogin: boolean;
    isActive: boolean;
    profileImage?: Image;
    resetTokens: PasswordResetToken[];
    notifications: Notification[];
    auditLogs: AuditLog[];
}
