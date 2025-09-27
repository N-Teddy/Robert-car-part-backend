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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const entity_enum_1 = require("../../common/enum/entity.enum");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const order_service_1 = require("./order.service");
const roles_decorator_1 = require("../../common/decorator/roles.decorator");
const order_dto_1 = require("../../dto/response/order.dto");
const order_dto_2 = require("../../dto/request/order.dto");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async create(createOrderDto, req) {
        return this.ordersService.create(createOrderDto, req.user.id);
    }
    async findAll(query) {
        const result = await this.ordersService.findAll(query);
        return {
            items: result.data,
            meta: {
                total: result.total,
                page: query.page,
                limit: query.limit,
                totalPages: Math.ceil(result.total / query.limit),
                hasNext: query.page < Math.ceil(result.total / query.limit),
                hasPrev: query.page > 1,
            },
        };
    }
    async getStats() {
        return this.ordersService.getStats();
    }
    async findOne(id) {
        return this.ordersService.findOne(id);
    }
    async update(id, updateOrderDto, req) {
        return this.ordersService.update(id, updateOrderDto, req.user.id);
    }
    async remove(id) {
        await this.ordersService.remove(id);
        return { message: 'Order deleted successfully' };
    }
    async generateReceipt(id, res) {
        const pdfBuffer = await this.ordersService.generateReceipt(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=order-${id}-receipt.pdf`);
        res.send(pdfBuffer);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new order' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: order_dto_1.OrderResponseDto }),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.CUSTOMER, entity_enum_1.UserRoleEnum.STAFF, entity_enum_1.UserRoleEnum.SALES, entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.DEV),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_2.CreateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: order_dto_1.PaginatedOrdersResponseDto }),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.STAFF, entity_enum_1.UserRoleEnum.SALES, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.DEV),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_2.OrderQueryDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: order_dto_1.OrderStatsResponseDto }),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.DEV),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific order by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: order_dto_1.OrderResponseDto }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.STAFF, entity_enum_1.UserRoleEnum.SALES, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.DEV),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an order' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: order_dto_1.OrderResponseDto }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.STAFF, entity_enum_1.UserRoleEnum.SALES, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.DEV),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_2.UpdateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an order' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.DEV),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/receipt'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate and download order receipt PDF' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.CUSTOMER, entity_enum_1.UserRoleEnum.STAFF, entity_enum_1.UserRoleEnum.SALES, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.DEV),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "generateReceipt", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('Orders'),
    (0, common_1.Controller)('orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [order_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=order.controller.js.map