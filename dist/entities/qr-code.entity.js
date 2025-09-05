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
exports.QrCode = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const part_entity_1 = require("./part.entity");
const image_entity_1 = require("./image.entity");
let QrCode = class QrCode extends base_entity_1.BaseEntity {
};
exports.QrCode = QrCode;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QrCode.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], QrCode.prototype, "encodedData", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => part_entity_1.Part, (part) => part.qrCode, {
        onDelete: 'CASCADE',
        nullable: false
    }),
    __metadata("design:type", part_entity_1.Part)
], QrCode.prototype, "part", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => image_entity_1.Image, (image) => image.qrCode, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    __metadata("design:type", image_entity_1.Image)
], QrCode.prototype, "image", void 0);
exports.QrCode = QrCode = __decorate([
    (0, typeorm_1.Entity)('qr_codes')
], QrCode);
//# sourceMappingURL=qr-code.entity.js.map