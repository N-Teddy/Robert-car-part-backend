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
exports.NotificationFilterDto = exports.MarkAsReadDto = exports.BatchSendNotificationDto = exports.SendNotificationDto = exports.CreateNotificationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const notification_enum_1 = require("../../common/enum/notification.enum");
class CreateNotificationDto {
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_enum_1.NotificationEnum }),
    (0, class_validator_1.IsEnum)(notification_enum_1.NotificationEnum),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateNotificationDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "userId", void 0);
class SendNotificationDto {
    constructor() {
        this.channel = notification_enum_1.NotificationChannelEnum.BOTH;
    }
}
exports.SendNotificationDto = SendNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_enum_1.NotificationEnum }),
    (0, class_validator_1.IsEnum)(notification_enum_1.NotificationEnum),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SendNotificationDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: notification_enum_1.NotificationAudienceEnum,
        description: 'Target audience for the notification',
    }),
    (0, class_validator_1.IsEnum)(notification_enum_1.NotificationAudienceEnum),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "audience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        description: 'Specific user IDs (used when audience is SPECIFIC_USER)',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SendNotificationDto.prototype, "userIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: notification_enum_1.NotificationChannelEnum,
        default: notification_enum_1.NotificationChannelEnum.BOTH,
    }),
    (0, class_validator_1.IsEnum)(notification_enum_1.NotificationChannelEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Custom email template name (optional)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "emailTemplate", void 0);
class BatchSendNotificationDto {
}
exports.BatchSendNotificationDto = BatchSendNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SendNotificationDto] }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SendNotificationDto),
    __metadata("design:type", Array)
], BatchSendNotificationDto.prototype, "notifications", void 0);
class MarkAsReadDto {
}
exports.MarkAsReadDto = MarkAsReadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        description: 'Notification IDs to mark as read',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], MarkAsReadDto.prototype, "notificationIds", void 0);
class NotificationFilterDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.NotificationFilterDto = NotificationFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: notification_enum_1.NotificationEnum }),
    (0, class_validator_1.IsEnum)(notification_enum_1.NotificationEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], NotificationFilterDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], NotificationFilterDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], NotificationFilterDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], NotificationFilterDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number (starting from 1)',
        minimum: 1,
        default: 1,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], NotificationFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of items per page',
        minimum: 1,
        maximum: 100,
        default: 20,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], NotificationFilterDto.prototype, "limit", void 0);
//# sourceMappingURL=notification.dto.js.map