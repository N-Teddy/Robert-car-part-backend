// src/modules/audit-log/audit-log.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { AuditActionEnum } from 'src/common/enum/entity.enum';
import { CreateAuditLogRequestDto } from 'src/dto/request/audit-log.dto';

@Injectable()
export class AuditLogService {
    private readonly logger = new Logger(AuditLogService.name);

    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
    ) { }

    async create(createAuditLogDto: CreateAuditLogRequestDto): Promise<AuditLog> {
        const auditLog = this.auditLogRepository.create(createAuditLogDto);
        return this.auditLogRepository.save(auditLog);
    }

    async logRequest(
        request: any,
        response: any,
        userId?: string,
    ): Promise<void> {
        const method = request.method.toUpperCase();

        // Map HTTP methods to audit actions
        const actionMap = {
            POST: AuditActionEnum.CREATE,
            PUT: AuditActionEnum.UPDATE,
            PATCH: AuditActionEnum.UPDATE,
            DELETE: AuditActionEnum.DELETE,
        };

        const action = actionMap[method];
        if (!action) return; // Skip GET requests

        // Create log asynchronously (non-blocking)
        this.createLogAsync(action, request, response, userId).catch(error => {
            this.logger.error('Failed to create audit log:', error.message);
        });
    }

    private async createLogAsync(
        action: AuditActionEnum,
        request: any,
        response: any,
        userId?: string,
    ): Promise<void> {
        const entity = this.extractEntityFromRoute(request.route);
        const ipAddress = request.ip || request.connection?.remoteAddress;
        const userAgent = request.get('user-agent');

        const details = {
            request: {
                body: request.body,
                params: request.params,
                query: request.query,
                headers: this.sanitizeHeaders(request.headers),
            },
            response: {
                statusCode: response.statusCode,
                statusMessage: response.statusMessage,
            },
            timestamp: new Date().toISOString(),
        };

        const createAuditLogDto: CreateAuditLogRequestDto = {
            action,
            entity,
            details,
            route: request.route?.path || request.url,
            ipAddress,
            userAgent,
            userId,
        };

        await this.create(createAuditLogDto);
    }

    private extractEntityFromRoute(route: any): string {
        if (!route) return 'unknown';

        const path = route.path || '';
        const segments = path.split('/').filter(segment => segment && !segment.match(/^:/));

        // Return the first meaningful segment as entity name
        return segments[1] || 'unknown';
    }

    private sanitizeHeaders(headers: any): any {
        const sensitiveHeaders = ['authorization', 'cookie', 'token', 'password'];
        const sanitized = { ...headers };

        sensitiveHeaders.forEach(header => {
            const lowerHeader = header.toLowerCase();
            Object.keys(sanitized).forEach(key => {
                if (key.toLowerCase() === lowerHeader) {
                    sanitized[key] = '***REDACTED***';
                }
            });
        });

        return sanitized;
    }

    async findAll(
        page: number = 1,
        limit: number = 10,
    ): Promise<{ data: AuditLog[]; total: number }> {
        const [data, total] = await this.auditLogRepository.findAndCount({
            relations: ['user'],
            order: { timestamp: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { data, total };
    }

    async findById(id: string): Promise<AuditLog> {
        return this.auditLogRepository.findOne({
            where: { id },
            relations: ['user'],
        });
    }

    async findByUserId(
        userId: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<{ data: AuditLog[]; total: number }> {
        const [data, total] = await this.auditLogRepository.findAndCount({
            where: { user: { id: userId } },
            relations: ['user'],
            order: { timestamp: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { data, total };
    }
}