// src/dto/response/report.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ReportTypeEnum, ReportPeriodEnum } from 'src/common/enum/entity.enum';
import { Report } from 'src/entities/report.entity';

export class ReportResponseDto {
	@ApiProperty()
	id: string;

	@ApiProperty({ enum: ReportTypeEnum })
	type: ReportTypeEnum;

	@ApiProperty({ enum: ReportPeriodEnum })
	period: ReportPeriodEnum;

	@ApiProperty()
	startDate: Date;

	@ApiProperty()
	endDate: Date;

	@ApiProperty()
	data: any;

	@ApiProperty()
	generatedBy?: string;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	static fromEntity(entity: Report): ReportResponseDto {
		const dto = new ReportResponseDto();
		dto.id = entity.id;
		dto.type = entity.type;
		dto.period = entity.period;
		dto.startDate = entity.startDate;
		dto.endDate = entity.endDate;
		dto.data = entity.data;
		dto.generatedBy = entity.generatedBy;
		dto.createdAt = entity.createdAt;
		dto.updatedAt = entity.updatedAt;
		return dto;
	}
}

export class ReportStatsResponseDto {
	@ApiProperty()
	totalReports: number;

	@ApiProperty()
	salesReports: number;

	@ApiProperty()
	inventoryReports: number;

	@ApiProperty()
	profitReports: number;

	@ApiProperty()
	dailyReports: number;

	@ApiProperty()
	weeklyReports: number;

	@ApiProperty()
	monthlyReports: number;

	@ApiProperty()
	yearlyReports: number;
}
