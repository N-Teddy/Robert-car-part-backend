"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const supabase_service_1 = require("./common/services/supabase.service");
const user_entity_1 = require("./entities/user.entity");
const password_reset_token_entity_1 = require("./entities/password-reset-token.entity");
const vehicle_entity_1 = require("./entities/vehicle.entity");
const vehicle_profit_entity_1 = require("./entities/vehicle-profit.entity");
const part_entity_1 = require("./entities/part.entity");
const category_entity_1 = require("./entities/category.entity");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const report_entity_1 = require("./entities/report.entity");
const notification_entity_1 = require("./entities/notification.entity");
const image_entity_1 = require("./entities/image.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const database_config_1 = require("./config/database.config");
const app_config_1 = require("./config/app.config");
const supabase_config_1 = require("./config/supabase.config");
const jwt_config_1 = require("./config/jwt.config");
const email_config_1 = require("./config/email.config");
const response_interceptor_1 = require("./common/interceptor/response.interceptor");
const auditLog_interceptor_1 = require("./common/interceptor/auditLog.interceptor");
const auditlog_module_1 = require("./modules/auditLog/auditlog.module");
const upload_module_1 = require("./modules/upload/upload.module");
const qr_code_entity_1 = require("./entities/qr-code.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                load: [
                    database_config_1.default,
                    app_config_1.default,
                    supabase_config_1.default,
                    jwt_config_1.default,
                    email_config_1.default,
                ],
            }),
            auditlog_module_1.AuditLogModule,
            upload_module_1.UploadModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const isProduction = process.env.NODE_ENV === 'production';
                    let connectionOptions;
                    if (isProduction) {
                        const supabaseDbUrl = configService.get('supabase.databaseUrl');
                        if (!supabaseDbUrl) {
                            throw new Error('SUPABASE_DATABASE_URL is not defined in production environment.');
                        }
                        connectionOptions = {
                            type: 'postgres',
                            url: supabaseDbUrl,
                            ssl: {
                                rejectUnauthorized: false,
                            },
                            synchronize: true,
                            entities: [
                                user_entity_1.User,
                                password_reset_token_entity_1.PasswordResetToken,
                                vehicle_entity_1.Vehicle,
                                vehicle_profit_entity_1.VehicleProfit,
                                part_entity_1.Part,
                                category_entity_1.Category,
                                order_entity_1.Order,
                                order_item_entity_1.OrderItem,
                                report_entity_1.Report,
                                notification_entity_1.Notification,
                                image_entity_1.Image,
                                audit_log_entity_1.AuditLog,
                                qr_code_entity_1.QrCode,
                            ],
                        };
                    }
                    else {
                        const db = configService.get('database');
                        connectionOptions = {
                            type: 'postgres',
                            host: db.host,
                            port: db.port,
                            username: db.username,
                            password: db.password,
                            database: db.database,
                            entities: [
                                user_entity_1.User,
                                password_reset_token_entity_1.PasswordResetToken,
                                vehicle_entity_1.Vehicle,
                                vehicle_profit_entity_1.VehicleProfit,
                                part_entity_1.Part,
                                category_entity_1.Category,
                                order_entity_1.Order,
                                order_item_entity_1.OrderItem,
                                report_entity_1.Report,
                                notification_entity_1.Notification,
                                image_entity_1.Image,
                                audit_log_entity_1.AuditLog,
                                qr_code_entity_1.QrCode,
                            ],
                            synchronize: true,
                            ssl: false,
                            extra: {
                                pool: db.pool,
                            },
                        };
                    }
                    return connectionOptions;
                },
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const rate = configService.get('app.rateLimit');
                    return [
                        {
                            ttl: rate.windowMs,
                            limit: rate.max,
                        },
                    ];
                },
            }),
            upload_module_1.UploadModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            supabase_service_1.SupabaseService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: response_interceptor_1.ResponseInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: auditLog_interceptor_1.AuditLogInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map