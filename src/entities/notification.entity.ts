import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { NotificationEnum } from 'src/common/enum/entity.enum';
import { BaseEntity } from './base.entity';


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

    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ default: false, name: 'email_sent' })
    emailSent: boolean;
}