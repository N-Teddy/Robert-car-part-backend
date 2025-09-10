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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenValidationResponseDto = exports.MessageResponseDto = exports.UserAuthInfo = exports.AuthResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const entity_enum_1 = require("../../common/enum/entity.enum");
class AuthResponseDto {
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AuthResponseDto.prototype, "expiresIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "tokenType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", UserAuthInfo)
], AuthResponseDto.prototype, "user", void 0);
class UserAuthInfo {
}
exports.UserAuthInfo = UserAuthInfo;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserAuthInfo.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserAuthInfo.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserAuthInfo.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: entity_enum_1.RoleEnum }),
    __metadata("design:type", typeof (_a = typeof entity_enum_1.RoleEnum !== "undefined" && entity_enum_1.RoleEnum) === "function" ? _a : Object)
], UserAuthInfo.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserAuthInfo.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], UserAuthInfo.prototype, "phoneNumber", void 0);
class MessageResponseDto {
}
exports.MessageResponseDto = MessageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Boolean)
], MessageResponseDto.prototype, "success", void 0);
class TokenValidationResponseDto {
}
exports.TokenValidationResponseDto = TokenValidationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], TokenValidationResponseDto.prototype, "valid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], TokenValidationResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], TokenValidationResponseDto.prototype, "email", void 0);
//# sourceMappingURL=auth.dto.js.map