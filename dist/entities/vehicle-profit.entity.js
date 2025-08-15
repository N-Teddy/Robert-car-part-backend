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
exports.VehicleProfit = void 0;
const typeorm_1 = require("typeorm");
const vehicle_entity_1 = require("./vehicle.entity");
const base_entity_1 = require("./base.entity");
let VehicleProfit = class VehicleProfit extends base_entity_1.BaseEntity {
};
exports.VehicleProfit = VehicleProfit;
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], VehicleProfit.prototype, "totalPartsRevenue", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], VehicleProfit.prototype, "totalPartsCost", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], VehicleProfit.prototype, "profit", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], VehicleProfit.prototype, "profitMargin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VehicleProfit.prototype, "isThresholdMet", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.Vehicle, (vehicle) => vehicle.profitRecords),
    __metadata("design:type", vehicle_entity_1.Vehicle)
], VehicleProfit.prototype, "vehicle", void 0);
exports.VehicleProfit = VehicleProfit = __decorate([
    (0, typeorm_1.Entity)('vehicle_profits')
], VehicleProfit);
//# sourceMappingURL=vehicle-profit.entity.js.map