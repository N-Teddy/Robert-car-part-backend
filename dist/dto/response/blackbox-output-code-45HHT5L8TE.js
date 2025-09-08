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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchSendResultDto = exports.SendNotificationResultDto = exports.NotificationResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const notification_enum_1 = require("../../common/enum/notification.enum");
class NotificationResponseDto {
}
exports.NotificationResponseDto = NotificationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_enum_1.NotificationEnum }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], NotificationResponseDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], NotificationResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], NotificationResponseDto.prototype, "emailSent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], NotificationResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], NotificationResponseDto.prototype, "updatedAt", void 0);
class SendNotificationResultDto {
}
exports.SendNotificationResultDto = SendNotificationResultDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SendNotificationResultDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SendNotificationResultDto.prototype, "totalRecipients", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SendNotificationResultDto.prototype, "emailsSent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SendNotificationResultDto.prototype, "emailsFailed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SendNotificationResultDto.prototype, "websocketsSent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], SendNotificationResultDto.prototype, "notificationIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Array)
], SendNotificationResultDto.prototype, "errors", void 0);
class BatchSendResultDto {
}
exports.BatchSendResultDto = BatchSendResultDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BatchSendResultDto.prototype, "totalBatches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BatchSendResultDto.prototype, "successfulBatches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BatchSendResultDto.prototype, "failedBatches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SendNotificationResultDto] }),
    __metadata("design:type", Array)
], BatchSendResultDto.prototype, "results", void 0);
//# sourceMappingURL=blackbox-output-code-45HHT5L8TE.js.map