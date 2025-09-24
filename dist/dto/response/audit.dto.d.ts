import { AuditActionEnum } from 'src/common/enum/entity.enum';
export declare class AuditLogResponseDto {
    id: string;
    userId: string;
    action: AuditActionEnum;
    entity: string;
    route: string;
    requestBody?: any;
    requestHeaders?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PaginatedAuditLogResponseDto {
    data: AuditLogResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class AuditLogFilterDto {
    page?: number;
    limit?: number;
    userId?: string;
    action?: AuditActionEnum;
    entity?: string;
    route?: string;
    startDate?: string;
    endDate?: string;
}
