// src/modules/report/report.controller.ts
import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	Query,
	Res,
	HttpStatus,
	UseInterceptors,
	ClassSerializerInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './report.service';
import { GenerateReportDto, ReportQueryDto } from 'src/dto/request/report.dto';
import {
	ReportResponseDto,
	ReportStatsResponseDto,
} from 'src/dto/response/report.dto';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseInterceptors(ClassSerializerInterceptor)
export class ReportController {
	constructor(private readonly reportService: ReportService) {}

	@Post()
	@ApiOperation({ summary: 'Generate a new report' })
	@ApiResponse({
		status: 201,
		description: 'Report generated successfully',
		type: ReportResponseDto,
	})
	async create(
		@Body() generateReportDto: GenerateReportDto
	): Promise<ReportResponseDto> {
		return this.reportService.generateReport(generateReportDto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all reports with optional filtering' })
	@ApiResponse({
		status: 200,
		description: 'List of reports',
		type: [ReportResponseDto],
	})
	async findAll(
		@Query() query: ReportQueryDto
	): Promise<{ data: ReportResponseDto[]; total: number }> {
		return this.reportService.findAll(query);
	}

	@Get('stats')
	@ApiOperation({ summary: 'Get report statistics' })
	@ApiResponse({
		status: 200,
		description: 'Report statistics',
		type: ReportStatsResponseDto,
	})
	async getStats(): Promise<ReportStatsResponseDto> {
		return this.reportService.getStats();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a specific report by ID' })
	@ApiResponse({
		status: 200,
		description: 'Report details',
		type: ReportResponseDto,
	})
	async findOne(@Param('id') id: string): Promise<ReportResponseDto> {
		return this.reportService.findOne(id);
	}

	@Get(':id/pdf')
	@ApiOperation({ summary: 'Download report as PDF' })
	@ApiResponse({ status: 200, description: 'PDF file' })
	async downloadPDF(
		@Param('id') id: string,
		@Res() res: Response
	): Promise<void> {
		try {
			const pdfBuffer = await this.reportService.generatePDF(id);

			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader(
				'Content-Disposition',
				`attachment; filename="report-${id}.pdf"`
			);
			res.setHeader('Content-Length', pdfBuffer.length);

			res.status(HttpStatus.OK).send(pdfBuffer);
		} catch (error) {
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to generate PDF',
				error: error.message,
			});
		}
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a report' })
	@ApiResponse({ status: 200, description: 'Report deleted successfully' })
	async remove(@Param('id') id: string): Promise<void> {
		return this.reportService.remove(id);
	}
}
