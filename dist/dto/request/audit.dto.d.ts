import { AuditActionEnum } from 'src/common/enum/entity.enum';
export declare class CreateAuditLogDto {
    userId: string;
    action: AuditActionEnum;
    entity: string;
    route: string;
    method: string;
    requestBody?: any;
    requestHeaders?: any;
    ipAddress?: string;
    userAgent?: string;
}
