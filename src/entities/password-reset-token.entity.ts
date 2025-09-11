import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken extends BaseEntity {
	@Column({ unique: true })
	token: string;

	@Column()
	expiresAt: Date;

	@Column({ default: false })
	isUsed: boolean;

	@ManyToOne(() => User, (user) => user.resetTokens, { onDelete: 'CASCADE' })
	user: User;
}
