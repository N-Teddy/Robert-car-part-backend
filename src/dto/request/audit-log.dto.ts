import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { AuditActionEnum } from 'src/common/enum/entity.enum';

export class CreateAuditLogRequestDto {
    @IsEnum(AuditActionEnum)
    action: AuditActionEnum;

    @IsString()
    entity: string;

    @IsObject()
    @IsOptional()
    details?: any;

    @IsString()
    route: string;

    @IsString()
    @IsOptional()
    ipAddress?: string;

    @IsString()
    @IsOptional()
    userAgent?: string;

    @IsString()
    @IsOptional()
    userId?: string;
}