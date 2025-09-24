import { Repository } from 'typeorm';
import { Order } from 'src/entities/order.entity';
import { Part } from 'src/entities/part.entity';
import { VehicleProfit } from 'src/entities/vehicle-profit.entity';
import { Vehicle } from 'src/entities/vehicle.entity';
import { GenerateReportDto, ReportQueryDto } from 'src/dto/request/report.dto';
import { ReportResponseDto, ReportStatsResponseDto } from 'src/dto/response/report.dto';
import { PDFService } from 'src/common/services/pdf.service';
import { Report } from 'src/entities/report.entity';
export declare class ReportService {
    private readonly reportRepository;
    private readonly orderRepository;
    private readonly partRepository;
    private readonly vehicleProfitRepository;
    private readonly vehicleRepository;
    private readonly pdfService;
    private readonly logger;
    constructor(reportRepository: Repository<Report>, orderRepository: Repository<Order>, partRepository: Repository<Part>, vehicleProfitRepository: Repository<VehicleProfit>, vehicleRepository: Repository<Vehicle>, pdfService: PDFService);
    generateReport(dto: GenerateReportDto, userId?: string): Promise<ReportResponseDto>;
    findAll(query: ReportQueryDto): Promise<{
        data: ReportResponseDto[];
        total: number;
    }>;
    findOne(id: string): Promise<ReportResponseDto>;
    remove(id: string): Promise<void>;
    getStats(): Promise<ReportStatsResponseDto>;
    generatePDF(reportId: string): Promise<Buffer>;
    private calculateDateRange;
    private generateSalesReport;
    private generateInventoryReport;
    private generateProfitReport;
    private generateComprehensiveReport;
}
