import { ReportPeriodEnum, ReportTypeEnum } from '../common/enum/entity.enum';
import { BaseEntity } from './base.entity';
export declare class Report extends BaseEntity {
    type: ReportTypeEnum;
    period: ReportPeriodEnum;
    startDate: Date;
    endDate: Date;
    data: any;
    generatedBy?: string;
}
