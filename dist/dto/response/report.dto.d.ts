import { ReportTypeEnum, ReportPeriodEnum } from 'src/common/enum/entity.enum';
import { Report } from 'src/entities/report.entity';
export declare class ReportResponseDto {
    id: string;
    type: ReportTypeEnum;
    period: ReportPeriodEnum;
    startDate: Date;
    endDate: Date;
    data: any;
    generatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(entity: Report): ReportResponseDto;
}
export declare class ReportStatsResponseDto {
    totalReports: number;
    salesReports: number;
    inventoryReports: number;
    profitReports: number;
    dailyReports: number;
    weeklyReports: number;
    monthlyReports: number;
    yearlyReports: number;
}
