// src/entities/audit-log.entity.ts
import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { AuditActionEnum } from 'src/common/enum/entity.enum';
import { BaseEntity } from './base.entity';
@Entity('audit_logs')
export class AuditLog extends BaseEntity {
	@ManyToOne(() => User, { nullable: true })
	user: User;

	@Column({ type: 'enum', enum: AuditActionEnum })
	action: AuditActionEnum;

	@Column()
	entity: string;

	@Column({ type: 'jsonb', nullable: true })
	details: any;

	@Column()
	route: string;

	@Column({ nullable: true })
	userId: string;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	timestamp: Date;
}
