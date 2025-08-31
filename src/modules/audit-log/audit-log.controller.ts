// src/modules/audit-log/audit-log.controller.ts
import {
    Controller,
    Get,
    Query,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { UserRoleEnum } from 'src/common/enum/entity.enum';
import { AuditLogResponseDto } from 'src/dto/response/audit-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) { }

    @Get()
    @ApiBearerAuth()
    async findAll(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    ) {
        const result = await this.auditLogService.findAll(page, limit);
        return {
            data: result.data.map(log => new AuditLogResponseDto(log)),
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit),
        };
    }

    @Get(':id')
    @ApiBearerAuth()
    async findById(@Param('id') id: string) {
        const auditLog = await this.auditLogService.findById(id);
        return new AuditLogResponseDto(auditLog);
    }

    @Get('user/:userId')
    @ApiBearerAuth()
    async findByUserId(
        @Param('userId') userId: string,
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    ) {
        const result = await this.auditLogService.findByUserId(userId, page, limit);
        return {
            data: result.data.map(log => new AuditLogResponseDto(log)),
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit),
        };
    }
}