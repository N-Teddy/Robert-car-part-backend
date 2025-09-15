"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../entities/order.entity");
const part_entity_1 = require("../../entities/part.entity");
const vehicle_profit_entity_1 = require("../../entities/vehicle-profit.entity");
const vehicle_entity_1 = require("../../entities/vehicle.entity");
const report_dto_1 = require("../../dto/response/report.dto");
const pdf_service_1 = require("../../common/services/pdf.service");
const entity_enum_1 = require("../../common/enum/entity.enum");
const report_entity_1 = require("../../entities/report.entity");
let ReportService = ReportService_1 = class ReportService {
    constructor(reportRepository, orderRepository, partRepository, vehicleProfitRepository, vehicleRepository, pdfService) {
        this.reportRepository = reportRepository;
        this.orderRepository = orderRepository;
        this.partRepository = partRepository;
        this.vehicleProfitRepository = vehicleProfitRepository;
        this.vehicleRepository = vehicleRepository;
        this.pdfService = pdfService;
        this.logger = new common_1.Logger(ReportService_1.name);
    }
    async generateReport(dto, userId) {
        try {
            const { startDate, endDate } = this.calculateDateRange(dto.period, dto.startDate, dto.endDate);
            let reportData;
            switch (dto.type) {
                case entity_enum_1.ReportTypeEnum.SALES:
                    reportData = await this.generateSalesReport(startDate, endDate);
                    break;
                case entity_enum_1.ReportTypeEnum.INVENTORY:
                    reportData = await this.generateInventoryReport();
                    break;
                case entity_enum_1.ReportTypeEnum.PROFIT:
                    reportData = await this.generateProfitReport(startDate, endDate);
                    break;
                case entity_enum_1.ReportTypeEnum.ALL:
                    reportData = await this.generateComprehensiveReport(startDate, endDate);
                    break;
                default:
                    throw new common_1.BadRequestException(`Unsupported report type: ${dto.type}`);
            }
            const report = this.reportRepository.create({
                type: dto.type,
                period: dto.period,
                startDate,
                endDate,
                data: reportData,
                generatedBy: userId || dto.generatedBy,
            });
            const savedReport = await this.reportRepository.save(report);
            return report_dto_1.ReportResponseDto.fromEntity(savedReport);
        }
        catch (error) {
            this.logger.error('Failed to generate report', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to generate report');
        }
    }
    async findAll(query) {
        try {
            const { type, period, startDate, endDate, generatedBy } = query;
            const where = {};
            if (type)
                where.type = type;
            if (period)
                where.period = period;
            if (generatedBy)
                where.generatedBy = generatedBy;
            if (startDate && endDate) {
                where.createdAt = (0, typeorm_2.Between)(new Date(startDate), new Date(endDate));
            }
            else if (startDate) {
                where.createdAt = (0, typeorm_2.MoreThanOrEqual)(new Date(startDate));
            }
            else if (endDate) {
                where.createdAt = (0, typeorm_2.LessThanOrEqual)(new Date(endDate));
            }
            const [reports, total] = await this.reportRepository.findAndCount({
                where,
                order: { createdAt: 'DESC' },
            });
            const data = reports.map(report_dto_1.ReportResponseDto.fromEntity);
            return { data, total };
        }
        catch (error) {
            this.logger.error('Failed to fetch reports', error);
            throw new common_1.InternalServerErrorException('Failed to fetch reports');
        }
    }
    async findOne(id) {
        try {
            const report = await this.reportRepository.findOne({ where: { id } });
            if (!report) {
                throw new common_1.NotFoundException(`Report with ID ${id} not found`);
            }
            return report_dto_1.ReportResponseDto.fromEntity(report);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to fetch report', error);
            throw new common_1.InternalServerErrorException('Failed to fetch report');
        }
    }
    async remove(id) {
        try {
            const report = await this.reportRepository.findOne({ where: { id } });
            if (!report) {
                throw new common_1.NotFoundException(`Report with ID ${id} not found`);
            }
            await this.reportRepository.remove(report);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to delete report', error);
            throw new common_1.InternalServerErrorException('Failed to delete report');
        }
    }
    async getStats() {
        try {
            const totalReports = await this.reportRepository.count();
            const salesReports = await this.reportRepository.count({
                where: { type: entity_enum_1.ReportTypeEnum.SALES },
            });
            const inventoryReports = await this.reportRepository.count({
                where: { type: entity_enum_1.ReportTypeEnum.INVENTORY },
            });
            const profitReports = await this.reportRepository.count({
                where: { type: entity_enum_1.ReportTypeEnum.PROFIT },
            });
            const dailyReports = await this.reportRepository.count({
                where: { period: entity_enum_1.ReportPeriodEnum.DAILY },
            });
            const weeklyReports = await this.reportRepository.count({
                where: { period: entity_enum_1.ReportPeriodEnum.WEEKLY },
            });
            const monthlyReports = await this.reportRepository.count({
                where: { period: entity_enum_1.ReportPeriodEnum.MONTHLY },
            });
            const yearlyReports = await this.reportRepository.count({
                where: { period: entity_enum_1.ReportPeriodEnum.YEARLY },
            });
            return {
                totalReports,
                salesReports,
                inventoryReports,
                profitReports,
                dailyReports,
                weeklyReports,
                monthlyReports,
                yearlyReports,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch report statistics', error);
            throw new common_1.InternalServerErrorException('Failed to fetch report statistics');
        }
    }
    async generatePDF(reportId) {
        try {
            const report = await this.reportRepository.findOne({ where: { id: reportId } });
            if (!report) {
                throw new common_1.NotFoundException(`Report with ID ${reportId} not found`);
            }
            let templateName;
            switch (report.type) {
                case entity_enum_1.ReportTypeEnum.SALES:
                    templateName = 'report-sales';
                    break;
                case entity_enum_1.ReportTypeEnum.INVENTORY:
                    templateName = 'report-inventory';
                    break;
                case entity_enum_1.ReportTypeEnum.PROFIT:
                    templateName = 'report-profit';
                    break;
                case entity_enum_1.ReportTypeEnum.ALL:
                    templateName = 'report-comprehensive';
                    break;
                default:
                    templateName = 'report-default';
            }
            const templateData = {
                report: report_dto_1.ReportResponseDto.fromEntity(report),
                generatedAt: new Date().toLocaleString(),
                company: {
                    name: 'Auto Parts Store',
                    address: '123 Automotive Road, Car City, CC 12345',
                    phone: '(555) 123-4567',
                    email: 'info@autopartsstore.com',
                    website: 'www.autopartsstore.com',
                },
            };
            console.log(JSON.stringify(templateData, null, 2));
            return this.pdfService.generatePDF(templateName, templateData);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to generate PDF', error);
            throw new common_1.InternalServerErrorException('Failed to generate PDF');
        }
    }
    calculateDateRange(period, customStartDate, customEndDate) {
        const now = new Date();
        let startDate;
        let endDate = now;
        if (customStartDate && customEndDate) {
            return { startDate: new Date(customStartDate), endDate: new Date(customEndDate) };
        }
        switch (period) {
            case entity_enum_1.ReportPeriodEnum.DAILY:
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                break;
            case entity_enum_1.ReportPeriodEnum.WEEKLY:
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case entity_enum_1.ReportPeriodEnum.MONTHLY:
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                break;
            case entity_enum_1.ReportPeriodEnum.YEARLY:
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case entity_enum_1.ReportPeriodEnum.CUSTOM:
                if (!customStartDate || !customEndDate) {
                    throw new common_1.BadRequestException('Custom period requires both startDate and endDate');
                }
                startDate = new Date(customStartDate);
                endDate = new Date(customEndDate);
                break;
            default:
                throw new common_1.BadRequestException(`Unsupported period: ${period}`);
        }
        return { startDate, endDate };
    }
    async generateSalesReport(startDate, endDate) {
        try {
            const orders = await this.orderRepository.find({
                where: {
                    createdAt: (0, typeorm_2.Between)(startDate, endDate),
                    status: entity_enum_1.OrderStatusEnum.COMPLETED,
                },
                relations: ['items', 'items.part'],
            });
            const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);
            const totalOrders = orders.length;
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
            const ordersByStatus = await this.orderRepository
                .createQueryBuilder('order')
                .select('order.status', 'status')
                .addSelect('COUNT(order.id)', 'count')
                .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
                .groupBy('order.status')
                .getRawMany();
            const ordersByMethod = await this.orderRepository
                .createQueryBuilder('order')
                .select('order.deliveryMethod', 'method')
                .addSelect('COUNT(order.id)', 'count')
                .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
                .groupBy('order.deliveryMethod')
                .getRawMany();
            return {
                period: { startDate, endDate },
                summary: {
                    totalRevenue,
                    totalOrders,
                    averageOrderValue,
                },
                ordersByStatus: ordersByStatus.map(item => ({
                    status: item.status,
                    count: parseInt(item.count),
                })),
                ordersByMethod: ordersByMethod.map(item => ({
                    method: item.method,
                    count: parseInt(item.count),
                })),
                orders: orders.map(order => ({
                    id: order.id,
                    totalAmount: order.totalAmount,
                    status: order.status,
                    customerName: order.customerName,
                    createdAt: order.createdAt,
                })),
            };
        }
        catch (error) {
            this.logger.error('Failed to generate sales report', error);
            throw new common_1.InternalServerErrorException('Failed to generate sales report data');
        }
    }
    async generateInventoryReport() {
        try {
            const totalParts = await this.partRepository.count();
            const lowStockParts = await this.partRepository.count({
                where: { quantity: (0, typeorm_2.LessThanOrEqual)(5) },
            });
            const outOfStockParts = await this.partRepository.count({
                where: { quantity: 0 },
            });
            const partsByCondition = await this.partRepository
                .createQueryBuilder('part')
                .select('part.condition', 'condition')
                .addSelect('COUNT(part.id)', 'count')
                .groupBy('part.condition')
                .getRawMany();
            const partsByVehicle = await this.partRepository
                .createQueryBuilder('part')
                .leftJoin('part.vehicle', 'vehicle')
                .select('vehicle.make', 'make')
                .addSelect('vehicle.model', 'model')
                .addSelect('COUNT(part.id)', 'count')
                .groupBy('vehicle.make, vehicle.model')
                .getRawMany();
            return {
                summary: {
                    totalParts,
                    lowStockParts,
                    outOfStockParts,
                    lowStockPercentage: totalParts > 0 ? (lowStockParts / totalParts) * 100 : 0,
                },
                partsByCondition: partsByCondition.map(item => ({
                    condition: item.condition,
                    count: parseInt(item.count),
                })),
                partsByVehicle: partsByVehicle.map(item => ({
                    make: item.make,
                    model: item.model,
                    count: parseInt(item.count),
                })),
            };
        }
        catch (error) {
            this.logger.error('Failed to generate inventory report', error);
            throw new common_1.InternalServerErrorException('Failed to generate inventory report data');
        }
    }
    async generateProfitReport(startDate, endDate) {
        try {
            const vehicleProfits = await this.vehicleProfitRepository.find({
                relations: ['vehicle'],
            });
            const totalRevenue = vehicleProfits.reduce((sum, vp) => sum + parseFloat(vp.totalPartsRevenue.toString()), 0);
            const totalCost = vehicleProfits.reduce((sum, vp) => sum + parseFloat(vp.totalPartsCost.toString()), 0);
            const totalProfit = vehicleProfits.reduce((sum, vp) => sum + parseFloat(vp.profit.toString()), 0);
            const averageProfitMargin = vehicleProfits.length > 0
                ? vehicleProfits.reduce((sum, vp) => sum + parseFloat(vp.profitMargin.toString()), 0) / vehicleProfits.length
                : 0;
            const profitableVehicles = vehicleProfits.filter(vp => vp.profit > 0).length;
            const thresholdMetVehicles = vehicleProfits.filter(vp => vp.isThresholdMet).length;
            const topPerformingVehicles = vehicleProfits
                .filter(vp => vp.profit > 0)
                .sort((a, b) => parseFloat(b.profit.toString()) - parseFloat(a.profit.toString()))
                .slice(0, 10)
                .map(vp => ({
                vehicle: vp.vehicle ? `${vp.vehicle.make} ${vp.vehicle.model} (${vp.vehicle.year})` : 'Unknown',
                revenue: vp.totalPartsRevenue,
                cost: vp.totalPartsCost,
                profit: vp.profit,
                profitMargin: vp.profitMargin,
            }));
            return {
                period: { startDate, endDate },
                summary: {
                    totalRevenue,
                    totalCost,
                    totalProfit,
                    averageProfitMargin,
                    profitableVehicles,
                    thresholdMetVehicles,
                    profitabilityRate: vehicleProfits.length > 0 ? (profitableVehicles / vehicleProfits.length) * 100 : 0,
                },
                topPerformingVehicles,
                totalVehicles: vehicleProfits.length,
            };
        }
        catch (error) {
            this.logger.error('Failed to generate profit report', error);
            throw new common_1.InternalServerErrorException('Failed to generate profit report data');
        }
    }
    async generateComprehensiveReport(startDate, endDate) {
        try {
            const salesData = await this.generateSalesReport(startDate, endDate);
            const inventoryData = await this.generateInventoryReport();
            const profitData = await this.generateProfitReport(startDate, endDate);
            return {
                sales: salesData,
                inventory: inventoryData,
                profit: profitData,
                generatedAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error('Failed to generate comprehensive report', error);
            throw new common_1.InternalServerErrorException('Failed to generate comprehensive report data');
        }
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = ReportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(part_entity_1.Part)),
    __param(3, (0, typeorm_1.InjectRepository)(vehicle_profit_entity_1.VehicleProfit)),
    __param(4, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        pdf_service_1.PDFService])
], ReportService);
//# sourceMappingURL=report.service.js.map