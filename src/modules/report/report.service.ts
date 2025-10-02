// src/modules/report/report.service.ts
import {
	Injectable,
	Logger,
	NotFoundException,
	BadRequestException,
	InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Order } from 'src/entities/order.entity';
import { Part } from 'src/entities/part.entity';
import { VehicleProfit } from 'src/entities/vehicle-profit.entity';
import { Vehicle } from 'src/entities/vehicle.entity';
import { GenerateReportDto, ReportQueryDto } from 'src/dto/request/report.dto';
import {
	ReportResponseDto,
	ReportStatsResponseDto,
} from 'src/dto/response/report.dto';
import { PDFService } from 'src/common/services/pdf.service';
import {
	OrderStatusEnum,
	ReportPeriodEnum,
	ReportTypeEnum,
} from 'src/common/enum/entity.enum';
import { Report } from 'src/entities/report.entity';

@Injectable()
export class ReportService {
	private readonly logger = new Logger(ReportService.name);

	constructor(
		@InjectRepository(Report)
		private readonly reportRepository: Repository<Report>,
		@InjectRepository(Order)
		private readonly orderRepository: Repository<Order>,
		@InjectRepository(Part)
		private readonly partRepository: Repository<Part>,
		@InjectRepository(VehicleProfit)
		private readonly vehicleProfitRepository: Repository<VehicleProfit>,
		@InjectRepository(Vehicle)
		private readonly vehicleRepository: Repository<Vehicle>,
		private readonly pdfService: PDFService
	) {}

	async generateReport(
		dto: GenerateReportDto,
		userId?: string
	): Promise<ReportResponseDto> {
		try {
			const { startDate, endDate } = this.calculateDateRange(
				dto.period,
				dto.startDate,
				dto.endDate
			);

			let reportData: any;

			switch (dto.type) {
				case ReportTypeEnum.SALES:
					reportData = await this.generateSalesReport(
						startDate,
						endDate
					);
					break;
				case ReportTypeEnum.INVENTORY:
					reportData = await this.generateInventoryReport();
					break;
				case ReportTypeEnum.PROFIT:
					reportData = await this.generateProfitReport(
						startDate,
						endDate
					);
					break;
				case ReportTypeEnum.ALL:
					reportData = await this.generateComprehensiveReport(
						startDate,
						endDate
					);
					break;
				default:
					throw new BadRequestException(
						`Unsupported report type: ${dto.type}`
					);
			}

			const report = this.reportRepository.create({
				type: dto.type,
				period: dto.period,
				startDate,
				endDate,
				data: reportData,
				generatedBy: userId,
			});

			const savedReport = await this.reportRepository.save(report);
			return ReportResponseDto.fromEntity(savedReport);
		} catch (error) {
			this.logger.error('Failed to generate report', error);
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to generate report');
		}
	}

	async findAll(
		query: ReportQueryDto
	): Promise<{ data: ReportResponseDto[]; total: number }> {
		try {
			const { type, period, startDate, endDate, generatedBy } = query;
			const where: any = {};

			if (type) where.type = type;
			if (period) where.period = period;
			if (generatedBy) where.generatedBy = generatedBy;

			if (startDate && endDate) {
				where.createdAt = Between(
					new Date(startDate),
					new Date(endDate)
				);
			} else if (startDate) {
				where.createdAt = MoreThanOrEqual(new Date(startDate));
			} else if (endDate) {
				where.createdAt = LessThanOrEqual(new Date(endDate));
			}

			const [reports, total] = await this.reportRepository.findAndCount({
				where,
				order: { createdAt: 'DESC' },
			});

			const data = reports.map(ReportResponseDto.fromEntity);
			return { data, total };
		} catch (error) {
			this.logger.error('Failed to fetch reports', error);
			throw new InternalServerErrorException('Failed to fetch reports');
		}
	}

	async findOne(id: string): Promise<ReportResponseDto> {
		try {
			const report = await this.reportRepository.findOne({
				where: { id },
			});

			if (!report) {
				throw new NotFoundException(`Report with ID ${id} not found`);
			}

			return ReportResponseDto.fromEntity(report);
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			this.logger.error('Failed to fetch report', error);
			throw new InternalServerErrorException('Failed to fetch report');
		}
	}

	async remove(id: string): Promise<void> {
		try {
			const report = await this.reportRepository.findOne({
				where: { id },
			});

			if (!report) {
				throw new NotFoundException(`Report with ID ${id} not found`);
			}

			await this.reportRepository.remove(report);
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			this.logger.error('Failed to delete report', error);
			throw new InternalServerErrorException('Failed to delete report');
		}
	}

	async getStats(): Promise<ReportStatsResponseDto> {
		try {
			const totalReports = await this.reportRepository.count();

			const salesReports = await this.reportRepository.count({
				where: { type: ReportTypeEnum.SALES },
			});

			const inventoryReports = await this.reportRepository.count({
				where: { type: ReportTypeEnum.INVENTORY },
			});

			const profitReports = await this.reportRepository.count({
				where: { type: ReportTypeEnum.PROFIT },
			});

			const dailyReports = await this.reportRepository.count({
				where: { period: ReportPeriodEnum.DAILY },
			});

			const weeklyReports = await this.reportRepository.count({
				where: { period: ReportPeriodEnum.WEEKLY },
			});

			const monthlyReports = await this.reportRepository.count({
				where: { period: ReportPeriodEnum.MONTHLY },
			});

			const yearlyReports = await this.reportRepository.count({
				where: { period: ReportPeriodEnum.YEARLY },
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
		} catch (error) {
			this.logger.error('Failed to fetch report statistics', error);
			throw new InternalServerErrorException(
				'Failed to fetch report statistics'
			);
		}
	}

	async generatePDF(reportId: string): Promise<Buffer> {
		try {
			const report = await this.reportRepository.findOne({
				where: { id: reportId },
			});

			if (!report) {
				throw new NotFoundException(
					`Report with ID ${reportId} not found`
				);
			}

			// Determine the appropriate template based on report type
			let templateName: string;
			switch (report.type) {
				case ReportTypeEnum.SALES:
					templateName = 'report-sales';
					break;
				case ReportTypeEnum.INVENTORY:
					templateName = 'report-inventory';
					break;
				case ReportTypeEnum.PROFIT:
					templateName = 'report-profit';
					break;
				case ReportTypeEnum.ALL:
					templateName = 'report-comprehensive';
					break;
				default:
					templateName = 'report-default';
			}

			const templateData = {
				report: ReportResponseDto.fromEntity(report),
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
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			this.logger.error('Failed to generate PDF', error);
			throw new InternalServerErrorException('Failed to generate PDF');
		}
	}

	private calculateDateRange(
		period: ReportPeriodEnum,
		customStartDate?: Date,
		customEndDate?: Date
	): { startDate: Date; endDate: Date } {
		const now = new Date();
		let startDate: Date;
		let endDate: Date = now;

		if (customStartDate && customEndDate) {
			return {
				startDate: new Date(customStartDate),
				endDate: new Date(customEndDate),
			};
		}

		switch (period) {
			case ReportPeriodEnum.DAILY:
				startDate = new Date(now);
				startDate.setHours(0, 0, 0, 0);
				break;
			case ReportPeriodEnum.WEEKLY:
				startDate = new Date(now);
				startDate.setDate(now.getDate() - 7);
				break;
			case ReportPeriodEnum.MONTHLY:
				startDate = new Date(now);
				startDate.setMonth(now.getMonth() - 1);
				break;
			case ReportPeriodEnum.YEARLY:
				startDate = new Date(now);
				startDate.setFullYear(now.getFullYear() - 1);
				break;
			case ReportPeriodEnum.CUSTOM:
				if (!customStartDate || !customEndDate) {
					throw new BadRequestException(
						'Custom period requires both startDate and endDate'
					);
				}
				startDate = new Date(customStartDate);
				endDate = new Date(customEndDate);
				break;
			default:
				throw new BadRequestException(`Unsupported period: ${period}`);
		}

		return { startDate, endDate };
	}

	private async generateSalesReport(
		startDate: Date,
		endDate: Date
	): Promise<any> {
		try {
			const orders = await this.orderRepository.find({
				where: {
					createdAt: Between(startDate, endDate),
					status: OrderStatusEnum.COMPLETED,
				},
				relations: ['items', 'items.part'],
			});

			const totalRevenue = orders.reduce(
				(sum, order) => sum + parseFloat(order.totalAmount.toString()),
				0
			);
			const totalOrders = orders.length;
			const averageOrderValue =
				totalOrders > 0 ? totalRevenue / totalOrders : 0;

			const ordersByStatus = await this.orderRepository
				.createQueryBuilder('order')
				.select('order.status', 'status')
				.addSelect('COUNT(order.id)', 'count')
				.where('order.createdAt BETWEEN :startDate AND :endDate', {
					startDate,
					endDate,
				})
				.groupBy('order.status')
				.getRawMany();

			const ordersByMethod = await this.orderRepository
				.createQueryBuilder('order')
				.select('order.deliveryMethod', 'method')
				.addSelect('COUNT(order.id)', 'count')
				.where('order.createdAt BETWEEN :startDate AND :endDate', {
					startDate,
					endDate,
				})
				.groupBy('order.deliveryMethod')
				.getRawMany();

			return {
				period: { startDate, endDate },
				summary: {
					totalRevenue,
					totalOrders,
					averageOrderValue,
				},
				ordersByStatus: ordersByStatus.map((item) => ({
					status: item.status,
					count: parseInt(item.count),
				})),
				ordersByMethod: ordersByMethod.map((item) => ({
					method: item.method,
					count: parseInt(item.count),
				})),
				orders: orders.map((order) => ({
					id: order.id,
					totalAmount: order.totalAmount,
					status: order.status,
					customerName: order.customerName,
					createdAt: order.createdAt,
				})),
			};
		} catch (error) {
			this.logger.error('Failed to generate sales report', error);
			throw new InternalServerErrorException(
				'Failed to generate sales report data'
			);
		}
	}

	private async generateInventoryReport(): Promise<any> {
		try {
			const totalParts = await this.partRepository.count();
			const lowStockParts = await this.partRepository.count({
				where: { quantity: LessThanOrEqual(5) },
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
					lowStockPercentage:
						totalParts > 0 ? (lowStockParts / totalParts) * 100 : 0,
				},
				partsByCondition: partsByCondition.map((item) => ({
					condition: item.condition,
					count: parseInt(item.count),
				})),
				partsByVehicle: partsByVehicle.map((item) => ({
					make: item.make,
					model: item.model,
					count: parseInt(item.count),
				})),
			};
		} catch (error) {
			this.logger.error('Failed to generate inventory report', error);
			throw new InternalServerErrorException(
				'Failed to generate inventory report data'
			);
		}
	}

	private async generateProfitReport(
		startDate: Date,
		endDate: Date
	): Promise<any> {
		try {
			const vehicleProfits = await this.vehicleProfitRepository.find({
				relations: ['vehicle'],
			});

			const totalRevenue = vehicleProfits.reduce(
				(sum, vp) => sum + parseFloat(vp.totalPartsRevenue.toString()),
				0
			);
			const totalCost = vehicleProfits.reduce(
				(sum, vp) => sum + parseFloat(vp.totalPartsCost.toString()),
				0
			);
			const totalProfit = vehicleProfits.reduce(
				(sum, vp) => sum + parseFloat(vp.profit.toString()),
				0
			);
			const averageProfitMargin =
				vehicleProfits.length > 0
					? vehicleProfits.reduce(
							(sum, vp) =>
								sum + parseFloat(vp.profitMargin.toString()),
							0
						) / vehicleProfits.length
					: 0;

			const profitableVehicles = vehicleProfits.filter(
				(vp) => vp.profit > 0
			).length;
			const thresholdMetVehicles = vehicleProfits.filter(
				(vp) => vp.isThresholdMet
			).length;

			const topPerformingVehicles = vehicleProfits
				.filter((vp) => vp.profit > 0)
				.sort(
					(a, b) =>
						parseFloat(b.profit.toString()) -
						parseFloat(a.profit.toString())
				)
				.slice(0, 10)
				.map((vp) => ({
					vehicle: vp.vehicle
						? `${vp.vehicle.make} ${vp.vehicle.model} (${vp.vehicle.year})`
						: 'Unknown',
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
					profitabilityRate:
						vehicleProfits.length > 0
							? (profitableVehicles / vehicleProfits.length) * 100
							: 0,
				},
				topPerformingVehicles,
				totalVehicles: vehicleProfits.length,
			};
		} catch (error) {
			this.logger.error('Failed to generate profit report', error);
			throw new InternalServerErrorException(
				'Failed to generate profit report data'
			);
		}
	}

	private async generateComprehensiveReport(
		startDate: Date,
		endDate: Date
	): Promise<any> {
		try {
			const salesData = await this.generateSalesReport(
				startDate,
				endDate
			);
			const inventoryData = await this.generateInventoryReport();
			const profitData = await this.generateProfitReport(
				startDate,
				endDate
			);

			return {
				sales: salesData,
				inventory: inventoryData,
				profit: profitData,
				generatedAt: new Date(),
			};
		} catch (error) {
			this.logger.error('Failed to generate comprehensive report', error);
			throw new InternalServerErrorException(
				'Failed to generate comprehensive report data'
			);
		}
	}
}
