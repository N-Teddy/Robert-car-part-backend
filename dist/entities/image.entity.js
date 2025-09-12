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
exports.Image = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const user_entity_1 = require("./user.entity");
const vehicle_entity_1 = require("./vehicle.entity");
const part_entity_1 = require("./part.entity");
const category_entity_1 = require("./category.entity");
const qr_code_entity_1 = require("./qr-code.entity");
const entity_enum_1 = require("../common/enum/entity.enum");
let Image = class Image extends base_entity_1.BaseEntity {
};
exports.Image = Image;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Image.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Image.prototype, "publicId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Image.prototype, "format", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Image.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: entity_enum_1.ImageEnum,
    }),
    __metadata("design:type", String)
], Image.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.profileImage, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", user_entity_1.User)
], Image.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.Vehicle, (vehicle) => vehicle.images, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", vehicle_entity_1.Vehicle)
], Image.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => part_entity_1.Part, (part) => part.images, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", part_entity_1.Part)
], Image.prototype, "part", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => category_entity_1.Category, (category) => category.image, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", category_entity_1.Category)
], Image.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => qr_code_entity_1.QrCode, (qrCode) => qrCode.image, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", qr_code_entity_1.QrCode)
], Image.prototype, "qrCode", void 0);
exports.Image = Image = __decorate([
    (0, typeorm_1.Entity)('images')
], Image);
//# sourceMappingURL=image.entity.js.map