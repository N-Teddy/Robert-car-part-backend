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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const password_reset_token_entity_1 = require("./password-reset-token.entity");
const notification_entity_1 = require("./notification.entity");
const image_entity_1 = require("./image.entity");
const entity_enum_1 = require("../common/enum/entity.enum");
const base_entity_1 = require("./base.entity");
const audit_log_entity_1 = require("./audit-log.entity");
let User = class User extends base_entity_1.BaseEntity {
};
exports.User = User;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: entity_enum_1.UserRoleEnum, default: entity_enum_1.UserRoleEnum.UNKNOWN }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isFirstLogin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => image_entity_1.Image, (image) => image.user, {
        nullable: true,
        eager: false,
        cascade: false,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", image_entity_1.Image)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => password_reset_token_entity_1.PasswordResetToken, (token) => token.user, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], User.prototype, "resetTokens", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.user, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => audit_log_entity_1.AuditLog, (auditLog) => auditLog.user, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], User.prototype, "auditLogs", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map