import { HealthCheckService, HttpHealthIndicator, DiskHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private health;
    private http;
    private readonly disk;
    private db;
    constructor(health: HealthCheckService, http: HttpHealthIndicator, disk: DiskHealthIndicator, db: TypeOrmHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
