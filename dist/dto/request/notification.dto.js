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
exports.GetNotificationsQueryDto = exports.MarkNotificationAsReadDto = exports.UpdateNotificationPreferencesDto = exports.CreateNotificationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const notification_enum_1 = require("../../common/enum/notification.enum");
class CreateNotificationDto {
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_enum_1.NotificationType }),
    (0, class_validator_1.IsEnum)(notification_enum_1.NotificationType),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_enum_1.NotificationChannel }),
    (0, class_validator_1.IsEnum)(notification_enum_1.NotificationChannel),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: notification_enum_1.NotificationPriority }),
    (0, class_validator_1.IsEnum)(notification_enum_1.NotificationPriority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateNotificationDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateNotificationDto.prototype, "payload", void 0);
class UpdateNotificationPreferencesDto {
}
exports.UpdateNotificationPreferencesDto = UpdateNotificationPreferencesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateNotificationPreferencesDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateNotificationPreferencesDto.prototype, "inApp", void 0);
class MarkNotificationAsReadDto {
}
exports.MarkNotificationAsReadDto = MarkNotificationAsReadDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MarkNotificationAsReadDto.prototype, "notificationId", void 0);
class GetNotificationsQueryDto {
    constructor() {
        this.limit = 20;
        this.offset = 0;
    }
}
exports.GetNotificationsQueryDto = GetNotificationsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: notification_enum_1.NotificationStatus }),
    (0, class_validator_1.IsEnum)(notification_enum_1.NotificationStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetNotificationsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: notification_enum_1.NotificationType }),
    (0, class_validator_1.IsEnum)(notification_enum_1.NotificationType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetNotificationsQueryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GetNotificationsQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GetNotificationsQueryDto.prototype, "offset", void 0);
//# sourceMappingURL=notification.dto.js.map