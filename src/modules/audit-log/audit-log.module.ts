// src/modules/audit-log/audit-log.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { AuditLogInterceptor } from 'src/common/interceptor/audit-log.interceptor';

@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],
    controllers: [AuditLogController],
    providers: [AuditLogService, AuditLogInterceptor],
    exports: [AuditLogService, AuditLogInterceptor],
})
export class AuditLogModule { }