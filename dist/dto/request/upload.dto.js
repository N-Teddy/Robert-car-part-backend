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
exports.BulkUploadDto = exports.UploadImageDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const entity_enum_1 = require("../../common/enum/entity.enum");
class UploadImageDto {
}
exports.UploadImageDto = UploadImageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of image being uploaded',
        enum: entity_enum_1.ImageEnum,
        example: entity_enum_1.ImageEnum.USER_PROFILE,
    }),
    (0, class_validator_1.IsEnum)(entity_enum_1.ImageEnum),
    __metadata("design:type", String)
], UploadImageDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the entity this image belongs to (optional)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UploadImageDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of entity this image belongs to (optional)',
        enum: ['user', 'vehicle', 'part'],
        example: 'user',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadImageDto.prototype, "entityType", void 0);
class BulkUploadDto {
}
exports.BulkUploadDto = BulkUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of image being uploaded',
        enum: entity_enum_1.ImageEnum,
        example: entity_enum_1.ImageEnum.VEHICLE,
    }),
    (0, class_validator_1.IsEnum)(entity_enum_1.ImageEnum),
    __metadata("design:type", String)
], BulkUploadDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the entity these images belong to (optional)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], BulkUploadDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of entity these images belong to (optional)',
        enum: ['user', 'vehicle', 'part'],
        example: 'vehicle',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkUploadDto.prototype, "entityType", void 0);
//# sourceMappingURL=upload.dto.js.map