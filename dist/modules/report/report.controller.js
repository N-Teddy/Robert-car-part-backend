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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const common_1 = require("@nestjs/common");
const report_service_1 = require("./report.service");
const report_dto_1 = require("../../dto/request/report.dto");
const report_dto_2 = require("../../dto/response/report.dto");
const swagger_1 = require("@nestjs/swagger");
let ReportController = class ReportController {
    constructor(reportService) {
        this.reportService = reportService;
    }
    async create(generateReportDto) {
        return this.reportService.generateReport(generateReportDto);
    }
    async findAll(query) {
        return this.reportService.findAll(query);
    }
    async getStats() {
        return this.reportService.getStats();
    }
    async findOne(id) {
        return this.reportService.findOne(id);
    }
    async downloadPDF(id, res) {
        try {
            const pdfBuffer = await this.reportService.generatePDF(id);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="report-${id}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            res.status(common_1.HttpStatus.OK).send(pdfBuffer);
        }
        catch (error) {
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to generate PDF',
                error: error.message,
            });
        }
    }
    async remove(id) {
        return this.reportService.remove(id);
    }
};
exports.ReportController = ReportController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a new report' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Report generated successfully', type: report_dto_2.ReportResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_dto_1.GenerateReportDto]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all reports with optional filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of reports', type: [report_dto_2.ReportResponseDto] }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get report statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report statistics', type: report_dto_2.ReportStatsResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific report by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report details', type: report_dto_2.ReportResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Download report as PDF' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'PDF file' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "downloadPDF", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "remove", null);
exports.ReportController = ReportController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [report_service_1.ReportService])
], ReportController);
//# sourceMappingURL=report.controller.js.map