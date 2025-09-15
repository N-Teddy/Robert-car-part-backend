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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const notification_service_1 = require("./notification.service");
const notification_dto_1 = require("../../dto/request/notification.dto");
const notification_dto_2 = require("../../dto/response/notification.dto");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async sendNotification(dto) {
        return this.notificationService.sendNotification(dto);
    }
    async batchSendNotifications(dto) {
        return this.notificationService.batchSendNotifications(dto);
    }
    async markAsRead(dto, req) {
        return this.notificationService.markAsRead(dto, req.user.id);
    }
    async getNotifications(filter) {
        return this.notificationService.getNotifications(filter);
    }
    async getUnreadCount(req) {
        const count = await this.notificationService.getUnreadCount(req.user.id);
        return { count };
    }
    async getNotificationById(id, req) {
        const notification = await this.notificationService.getNotificationById(id, req.user.id);
        return notification;
    }
    async cleanupOldNotifications(daysToKeep) {
        const deleted = await this.notificationService.deleteOldNotifications(daysToKeep || 30);
        return { deleted };
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send notification to users' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: notification_dto_2.SendNotificationResultDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.SendNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Post)('batch-send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send multiple notifications in batch' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: notification_dto_2.BatchSendResultDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.BatchSendNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "batchSendNotifications", null);
__decorate([
    (0, common_1.Put)('mark-as-read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notifications as read' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.MarkAsReadDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get notifications with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [notification_dto_2.NotificationResponseDto] }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.NotificationFilterDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread notifications count' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: notification_dto_2.NotificationResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotificationById", null);
__decorate([
    (0, common_1.Delete)('cleanup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete old read notifications' }),
    __param(0, (0, common_1.Query)('daysToKeep')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "cleanupOldNotifications", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map