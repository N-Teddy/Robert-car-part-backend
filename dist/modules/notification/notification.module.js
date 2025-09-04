"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const schedule_1 = require("@nestjs/schedule");
const event_emitter_1 = require("@nestjs/event-emitter");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const notification_controller_1 = require("./notification.controller");
const notification_service_1 = require("./notification.service");
const notification_processor_1 = require("./notification.processor");
const notification_gateway_1 = require("./notification.gateway");
const notification_entity_1 = require("../../entities/notification.entity");
const user_entity_1 = require("../../entities/user.entity");
const audit_log_module_1 = require("../audit-log/audit-log.module");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([notification_entity_1.Notification, user_entity_1.User]),
            bull_1.BullModule.registerQueue({
                name: 'notifications',
                defaultJobOptions: {
                    removeOnComplete: true,
                    removeOnFail: false,
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: false,
                delimiter: '.',
                newListener: false,
                removeListener: false,
                maxListeners: 10,
                verboseMemoryLeak: false,
                ignoreErrors: false,
            }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            audit_log_module_1.AuditLogModule,
        ],
        controllers: [notification_controller_1.NotificationController],
        providers: [notification_service_1.NotificationService, notification_processor_1.NotificationProcessor, notification_gateway_1.NotificationGateway],
        exports: [notification_service_1.NotificationService],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map