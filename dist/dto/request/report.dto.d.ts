import { ReportTypeEnum, ReportPeriodEnum } from 'src/common/enum/entity.enum';
export declare class GenerateReportDto {
    type: ReportTypeEnum;
    period: ReportPeriodEnum;
    startDate?: Date;
    endDate?: Date;
    generatedBy?: string;
}
export declare class ReportQueryDto {
    type?: ReportTypeEnum;
    period?: ReportPeriodEnum;
    startDate?: Date;
    endDate?: Date;
    generatedBy?: string;
}
