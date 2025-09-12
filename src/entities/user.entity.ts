import {
	Column,
	Entity,
	OneToMany,
	ManyToOne,
	OneToOne,
	JoinColumn,
} from 'typeorm';
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

	@OneToOne(() => Image, (image) => image.user, {
		nullable: true,
		eager: false,
		cascade: false,
		onDelete: 'SET NULL',
	})
	@JoinColumn()
	profileImage?: Image;

	@OneToMany(() => PasswordResetToken, (token) => token.user, {
		onDelete: 'CASCADE',
	})
	resetTokens: PasswordResetToken[];

	@OneToMany(() => Notification, (notification) => notification.user, {
		onDelete: 'CASCADE',
	})
	notifications: Notification[];

	@OneToMany(() => AuditLog, (auditLog) => auditLog.user, {
		onDelete: 'CASCADE',
	})
	auditLogs: AuditLog[];
}
