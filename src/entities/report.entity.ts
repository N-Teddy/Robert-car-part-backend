import { ReportPeriodEnum, ReportTypeEnum } from 'src/common/enum/entity.enum';
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('reports')
export class Report extends BaseEntity {
	@Column({
		type: 'enum',
		enum: ReportTypeEnum,
		default: ReportTypeEnum.SALES,
	})
	type: ReportTypeEnum;

	@Column({
		type: 'enum',
		enum: ReportPeriodEnum,
		default: ReportPeriodEnum.DAILY,
	})
	period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

	@Column({ type: 'date' })
	startDate: Date;

	@Column({ type: 'date' })
	endDate: Date;

	@Column({ type: 'jsonb' })
	data: any;

	@Column({ nullable: true })
	generatedBy?: string; // User ID who generated the report
}
