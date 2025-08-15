import { User } from './user.entity';
import { BaseEntity } from './base.entity';
export declare class PasswordResetToken extends BaseEntity {
    token: string;
    expiresAt: Date;
    isUsed: boolean;
    user: User;
}
