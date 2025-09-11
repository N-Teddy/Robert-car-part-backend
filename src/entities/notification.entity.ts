// src/entities/notification.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { NotificationEnum } from 'src/common/enum/notification.enum';

@Entity('notifications')
export class Notification extends BaseEntity {
	@Column({ type: 'enum', enum: NotificationEnum })
	type: NotificationEnum;

	@Column()
	title: string;

	@Column('text')
	message: string;

	@Column({ default: false })
	isRead: boolean;

	@Column('jsonb', { nullable: true })
	metadata: Record<string, any>;

	@ManyToOne(() => User, (user) => user.notifications, {
		nullable: true,
		onDelete: 'CASCADE',
	})
	user?: User | null;

	@Column({ default: false, name: 'email_sent' })
	emailSent: boolean;
}
