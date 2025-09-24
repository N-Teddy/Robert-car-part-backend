"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const report_service_1 = require("./report.service");
const report_controller_1 = require("./report.controller");
const report_entity_1 = require("../../entities/report.entity");
const order_entity_1 = require("../../entities/order.entity");
const part_entity_1 = require("../../entities/part.entity");
const vehicle_profit_entity_1 = require("../../entities/vehicle-profit.entity");
const vehicle_entity_1 = require("../../entities/vehicle.entity");
const pdf_service_1 = require("../../common/services/pdf.service");
let ReportModule = class ReportModule {
};
exports.ReportModule = ReportModule;
exports.ReportModule = ReportModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([report_entity_1.Report, order_entity_1.Order, part_entity_1.Part, vehicle_profit_entity_1.VehicleProfit, vehicle_entity_1.Vehicle]),
        ],
        controllers: [report_controller_1.ReportController],
        providers: [report_service_1.ReportService, pdf_service_1.PDFService],
        exports: [report_service_1.ReportService, pdf_service_1.PDFService],
    })
], ReportModule);
//# sourceMappingURL=report.module.js.map