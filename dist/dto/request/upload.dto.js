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
exports.DeleteImageDto = exports.UploadMultipleImagesDto = exports.UploadImageDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const entity_enum_1 = require("../../common/enum/entity.enum");
class UploadImageDto {
}
exports.UploadImageDto = UploadImageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of entity the image belongs to',
        enum: entity_enum_1.ImageEnum
    }),
    (0, class_validator_1.IsEnum)(entity_enum_1.ImageEnum),
    __metadata("design:type", String)
], UploadImageDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the entity this image belongs to'
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UploadImageDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata for the image'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UploadImageDto.prototype, "metadata", void 0);
class UploadMultipleImagesDto {
}
exports.UploadMultipleImagesDto = UploadMultipleImagesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of entity the images belong to',
        enum: entity_enum_1.ImageEnum
    }),
    (0, class_validator_1.IsEnum)(entity_enum_1.ImageEnum),
    __metadata("design:type", String)
], UploadMultipleImagesDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the entity these images belong to'
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UploadMultipleImagesDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata for the images'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UploadMultipleImagesDto.prototype, "metadata", void 0);
class DeleteImageDto {
}
exports.DeleteImageDto = DeleteImageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the image to delete'
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DeleteImageDto.prototype, "imageId", void 0);
//# sourceMappingURL=upload.dto.js.map