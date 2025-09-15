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
exports.PartController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const part_service_1 = require("./part.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const part_dto_1 = require("../../dto/request/part.dto");
let PartController = class PartController {
    constructor(partService) {
        this.partService = partService;
    }
    async create(dto, images, req) {
        return this.partService.create(dto, images, req.user.id);
    }
    async findAll(queryDto) {
        return this.partService.findAll(queryDto);
    }
    async findOne(id) {
        return this.partService.findOne(id);
    }
    async update(id, dto, images, req) {
        return this.partService.update(id, dto, images, req.user.id);
    }
    async remove(id, req) {
        return this.partService.remove(id, req.user.id);
    }
    async getStatistics() {
        return this.partService.getStatistics();
    }
    async getCategoryStatistics() {
        return this.partService.getCategoryStatistics();
    }
    async getLowStockParts() {
        return this.partService.getLowStockParts();
    }
};
exports.PartController = PartController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new part with QR code' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [part_dto_1.CreatePartDto, Array, Object]),
    __metadata("design:returntype", Promise)
], PartController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated list of parts with filters' }),
    __param(0, (0, common_1.Query)('page')),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [part_dto_1.PartsQueryDto]),
    __metadata("design:returntype", Promise)
], PartController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific part' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PartController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a part' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, part_dto_1.UpdatePartDto, Array, Object]),
    __metadata("design:returntype", Promise)
], PartController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a part' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PartController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('stats/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get part statistics summary' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PartController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('stats/category'),
    (0, swagger_1.ApiOperation)({ summary: 'Get part statistics by category' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PartController.prototype, "getCategoryStatistics", null);
__decorate([
    (0, common_1.Get)('inventory/low-stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Get low stock parts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PartController.prototype, "getLowStockParts", null);
exports.PartController = PartController = __decorate([
    (0, swagger_1.ApiTags)('Parts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('parts'),
    __metadata("design:paramtypes", [part_service_1.PartService])
], PartController);
//# sourceMappingURL=part.controller.js.map