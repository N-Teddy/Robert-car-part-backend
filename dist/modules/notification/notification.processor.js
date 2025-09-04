"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
let NotificationProcessor = NotificationProcessor_1 = class NotificationProcessor {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(NotificationProcessor_1.name);
    }
    async handleNotification(job) {
        this.logger.log(`Processing notification ${job.data.notificationId}`);
        try {
            await this.notificationService.processNotification(job.data.notificationId);
            this.logger.log(`Successfully processed notification ${job.data.notificationId}`);
        }
        catch (error) {
            this.logger.error(`Failed to process notification ${job.data.notificationId}`, error);
            throw error;
        }
    }
};
exports.NotificationProcessor = NotificationProcessor;
__decorate([
    (0, bull_1.Process)('process-notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationProcessor.prototype, "handleNotification", null);
exports.NotificationProcessor = NotificationProcessor = NotificationProcessor_1 = __decorate([
    (0, bull_1.Processor)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationProcessor);
//# sourceMappingURL=notification.processor.js.map