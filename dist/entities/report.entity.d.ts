import { ReportTypeEnum } from 'src/common/enum/entity.enum';
import { BaseEntity } from './base.entity';
export declare class Report extends BaseEntity {
    type: ReportTypeEnum;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    startDate: Date;
    endDate: Date;
    data: any;
    generatedBy?: string;
}
