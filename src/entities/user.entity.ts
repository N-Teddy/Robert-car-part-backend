import { Column, Entity, OneToMany, ManyToOne } from 'typeorm';
import { PasswordResetToken } from './password-reset-token.entity';
import { Notification } from './notification.entity';
import { Image } from './image.entity';
import { UserRoleEnum } from 'src/common/enum/entity.enum';
import { BaseEntity } from './base.entity';
import { AuditLog } from './audit-log.entity';

@Entity('users')
export class User extends BaseEntity {
	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column({ nullable: true })
	fullName: string;

	@Column({ nullable: true })
	phoneNumber: string;

	@Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.UNKNOWN })
	role: UserRoleEnum;

	@Column({ default: true })
	isFirstLogin: boolean;

	@Column({ default: true })
	isActive: boolean;

	@ManyToOne(() => Image, { nullable: true })
	profileImage?: Image;

	@OneToMany(() => PasswordResetToken, (token) => token.user)
	resetTokens: PasswordResetToken[];

	@OneToMany(() => Notification, (notification) => notification.user)
	notifications: Notification[];

	@OneToMany(() => AuditLog, (auditLog) => auditLog.user)
	auditLogs: AuditLog[];
}
