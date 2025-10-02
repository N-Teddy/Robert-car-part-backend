import { Response } from 'express';
import { ReportService } from './report.service';
import { GenerateReportDto, ReportQueryDto } from 'src/dto/request/report.dto';
import { ReportResponseDto, ReportStatsResponseDto } from 'src/dto/response/report.dto';
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    create(generateReportDto: GenerateReportDto, req: any): Promise<ReportResponseDto>;
    findAll(query: ReportQueryDto): Promise<{
        data: ReportResponseDto[];
        total: number;
    }>;
    getStats(): Promise<ReportStatsResponseDto>;
    findOne(id: string): Promise<ReportResponseDto>;
    downloadPDF(id: string, res: Response): Promise<void>;
    remove(id: string): Promise<void>;
}
