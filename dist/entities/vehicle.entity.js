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
exports.Vehicle = void 0;
const typeorm_1 = require("typeorm");
const part_entity_1 = require("./part.entity");
const vehicle_profit_entity_1 = require("./vehicle-profit.entity");
const image_entity_1 = require("./image.entity");
const base_entity_1 = require("./base.entity");
let Vehicle = class Vehicle extends base_entity_1.BaseEntity {
};
exports.Vehicle = Vehicle;
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Vehicle.prototype, "make", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Vehicle.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint' }),
    __metadata("design:type", Number)
], Vehicle.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Vehicle.prototype, "vin", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Vehicle.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Vehicle.prototype, "purchasePrice", void 0);
__decorate([
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", Date)
], Vehicle.prototype, "purchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vehicle.prototype, "auctionName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Vehicle.prototype, "isPartedOut", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => part_entity_1.Part, (part) => part.vehicle),
    __metadata("design:type", Array)
], Vehicle.prototype, "parts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vehicle_profit_entity_1.VehicleProfit, (profit) => profit.vehicle),
    __metadata("design:type", Array)
], Vehicle.prototype, "profitRecords", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => image_entity_1.Image, (image) => image.vehicle),
    __metadata("design:type", Array)
], Vehicle.prototype, "images", void 0);
exports.Vehicle = Vehicle = __decorate([
    (0, typeorm_1.Entity)('vehicles')
], Vehicle);
//# sourceMappingURL=vehicle.entity.js.map