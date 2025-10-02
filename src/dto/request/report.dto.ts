// src/dto/request/report.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsDateString, IsOptional, IsString } from 'class-validator';
import { ReportTypeEnum, ReportPeriodEnum } from 'src/common/enum/entity.enum';

export class GenerateReportDto {
	@ApiProperty({ enum: ReportTypeEnum })
	@IsEnum(ReportTypeEnum)
	type: ReportTypeEnum;

	@ApiProperty({ enum: ReportPeriodEnum })
	@IsEnum(ReportPeriodEnum)
	period: ReportPeriodEnum;

	@ApiPropertyOptional()
	@IsDateString()
	@IsOptional()
	startDate?: Date;

	@ApiPropertyOptional()
	@IsDateString()
	@IsOptional()
	endDate?: Date;
}

export class ReportQueryDto {
	@ApiPropertyOptional({ enum: ReportTypeEnum })
	@IsEnum(ReportTypeEnum)
	@IsOptional()
	type?: ReportTypeEnum;

	@ApiPropertyOptional({ enum: ReportPeriodEnum })
	@IsEnum(ReportPeriodEnum)
	@IsOptional()
	period?: ReportPeriodEnum;

	@ApiPropertyOptional()
	@IsDateString()
	@IsOptional()
	startDate?: Date;

	@ApiPropertyOptional()
	@IsDateString()
	@IsOptional()
	endDate?: Date;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	generatedBy?: string;
}
