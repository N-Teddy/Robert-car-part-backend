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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_enum_1 = require("../../common/enum/notification.enum");
const order_entity_1 = require("../../entities/order.entity");
const order_item_entity_1 = require("../../entities/order-item.entity");
const part_entity_1 = require("../../entities/part.entity");
const entity_enum_1 = require("../../common/enum/entity.enum");
const notification_service_1 = require("../notification/notification.service");
const pdf_service_1 = require("../../common/services/pdf.service");
const vehicle_profit_entity_1 = require("../../entities/vehicle-profit.entity");
let OrdersService = class OrdersService {
    constructor(orderRepository, orderItemRepository, partRepository, vehicleProfitRepository, notificationsService, pdfService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.partRepository = partRepository;
        this.vehicleProfitRepository = vehicleProfitRepository;
        this.notificationsService = notificationsService;
        this.pdfService = pdfService;
    }
    async create(createOrderDto, userId) {
        const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let totalAmount = 0;
            const orderItems = [];
            const vehicleProfitMap = new Map();
            const partIds = createOrderDto.items.map((item) => item.partId);
            const parts = await queryRunner.manager.find(part_entity_1.Part, {
                where: { id: (0, typeorm_2.In)(partIds) },
                relations: ['vehicle', 'category'],
            });
            const partMap = new Map(parts.map((part) => [part.id, part]));
            for (const itemDto of createOrderDto.items) {
                const part = partMap.get(itemDto.partId);
                if (!part) {
                    throw new common_1.NotFoundException(`Part with ID ${itemDto.partId} not found`);
                }
                if (part.quantity < itemDto.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for part ${part.name}`);
                }
                const unitPrice = itemDto.unitPrice || part.price;
                const itemTotal = unitPrice * itemDto.quantity - (itemDto.discount || 0);
                totalAmount += itemTotal;
                const orderItem = this.orderItemRepository.create({
                    part: part,
                    quantity: itemDto.quantity,
                    unitPrice,
                    discount: itemDto.discount || 0,
                    createdBy: userId,
                });
                orderItems.push(orderItem);
                await queryRunner.manager.update(part_entity_1.Part, { id: part.id }, { quantity: part.quantity - itemDto.quantity });
                if (part.vehicle) {
                    const vehicleId = part.vehicle.id;
                    const current = vehicleProfitMap.get(vehicleId) || {
                        revenue: 0,
                        cost: 0,
                    };
                    const partCost = part.price || 0;
                    vehicleProfitMap.set(vehicleId, {
                        revenue: current.revenue + itemTotal,
                        cost: current.cost + partCost * itemDto.quantity,
                    });
                }
            }
            const order = this.orderRepository.create({
                ...createOrderDto,
                totalAmount,
                items: orderItems,
                createdBy: userId,
            });
            const savedOrder = await queryRunner.manager.save(order);
            for (const [vehicleId, profitData] of vehicleProfitMap.entries()) {
                await this.updateVehicleProfit(vehicleId, profitData.revenue, profitData.cost, queryRunner.manager);
            }
            await this.sendOrderNotification(notification_enum_1.NotificationEnum.ORDER_CREATED, 'New Order Created', `A new order #${savedOrder.id} has been created`, savedOrder);
            await queryRunner.commitTransaction();
            return this.mapToResponseDto(await this.findOneEntity(savedOrder.id));
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(query) {
        const { page, limit, status, deliveryMethod, customerName, customerPhone, customerEmail, startDate, endDate, sortBy, sortOrder, } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (deliveryMethod)
            where.deliveryMethod = deliveryMethod;
        if (customerName)
            where.customerName = customerName;
        if (customerPhone)
            where.customerPhone = customerPhone;
        if (customerEmail)
            where.customerEmail = customerEmail;
        if (startDate && endDate) {
            where.createdAt = (0, typeorm_2.Between)(new Date(startDate), new Date(endDate));
        }
        else if (startDate) {
            where.createdAt = (0, typeorm_2.MoreThanOrEqual)(new Date(startDate));
        }
        else if (endDate) {
            where.createdAt = (0, typeorm_2.LessThanOrEqual)(new Date(endDate));
        }
        const [orders, total] = await this.orderRepository.findAndCount({
            where,
            relations: [
                'items',
                'items.part',
                'items.part.vehicle',
                'items.part.category',
                'items.part.images'
            ],
            order: { [sortBy]: sortOrder },
            skip,
            take: limit,
        });
        const data = orders.map((order) => this.mapToResponseDto(order));
        return { data, total };
    }
    async findOne(id) {
        const order = await this.findOneEntity(id);
        return this.mapToResponseDto(order);
    }
    async findOneEntity(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: [
                'items',
                'items.part',
                'items.part.vehicle',
                'items.part.category',
                'items.part.images'
            ],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
    async update(id, updateOrderDto, userId) {
        const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = await this.findOneEntity(id);
            const previousStatus = order.status;
            const { items, ...orderUpdateData } = updateOrderDto;
            const shouldUpdateProfits = (updateOrderDto.status === entity_enum_1.OrderStatusEnum.COMPLETED &&
                previousStatus !== entity_enum_1.OrderStatusEnum.COMPLETED) ||
                (previousStatus === entity_enum_1.OrderStatusEnum.COMPLETED &&
                    updateOrderDto.status !== entity_enum_1.OrderStatusEnum.COMPLETED);
            const updatedOrder = await queryRunner.manager.save(order_entity_1.Order, {
                ...order,
                ...updateOrderDto,
                updatedBy: userId,
            });
            if (items && items.length > 0) {
                await queryRunner.manager.delete(order_item_entity_1.OrderItem, { order: { id } });
                const orderItems = items.map(item => queryRunner.manager.create(order_item_entity_1.OrderItem, {
                    ...item,
                    order: { id },
                    part: { id: item.partId }
                }));
                await queryRunner.manager.save(order_item_entity_1.OrderItem, orderItems);
            }
            if (shouldUpdateProfits) {
                const vehicleProfitMap = new Map();
                for (const item of order.items) {
                    const part = await queryRunner.manager.findOne(part_entity_1.Part, {
                        where: { id: item.part.id },
                        relations: ['vehicle'],
                    });
                    if (part && part.vehicle) {
                        const vehicleId = part.vehicle.id;
                        const current = vehicleProfitMap.get(vehicleId) || {
                            revenue: 0,
                            cost: 0,
                        };
                        const multiplier = updateOrderDto.status === entity_enum_1.OrderStatusEnum.COMPLETED
                            ? 1
                            : -1;
                        const partCost = part.price || 0;
                        vehicleProfitMap.set(vehicleId, {
                            revenue: current.revenue +
                                multiplier *
                                    (item.unitPrice * item.quantity -
                                        item.discount),
                            cost: current.cost +
                                multiplier * (partCost * item.quantity),
                        });
                    }
                }
                for (const [vehicleId, profitData,] of vehicleProfitMap.entries()) {
                    await this.updateVehicleProfit(vehicleId, profitData.revenue, profitData.cost, queryRunner.manager);
                }
            }
            if (updateOrderDto.status &&
                updateOrderDto.status !== previousStatus) {
                let notificationType;
                let title;
                let message;
                switch (updateOrderDto.status) {
                    case entity_enum_1.OrderStatusEnum.COMPLETED:
                        notificationType = notification_enum_1.NotificationEnum.ORDER_COMPLETED;
                        title = 'Order Completed';
                        message = `Order #${id} has been completed`;
                        break;
                    case entity_enum_1.OrderStatusEnum.CANCELLED:
                        notificationType = notification_enum_1.NotificationEnum.ORDER_CANCELLED;
                        title = 'Order Cancelled';
                        message = `Order #${id} has been cancelled`;
                        break;
                    default:
                        notificationType = notification_enum_1.NotificationEnum.ORDER_UPDATED;
                        title = 'Order Updated';
                        message = `Order #${id} has been updated`;
                }
                await this.sendOrderNotification(notificationType, title, message, updatedOrder);
            }
            await queryRunner.commitTransaction();
            return this.mapToResponseDto(await this.findOneEntity(id));
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async remove(id) {
        const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = await this.findOneEntity(id);
            if (order.status === entity_enum_1.OrderStatusEnum.COMPLETED) {
                const vehicleProfitMap = new Map();
                for (const item of order.items) {
                    const part = await queryRunner.manager.findOne(part_entity_1.Part, {
                        where: { id: item.part.id },
                        relations: ['vehicle'],
                    });
                    if (part && part.vehicle) {
                        const vehicleId = part.vehicle.id;
                        const current = vehicleProfitMap.get(vehicleId) || {
                            revenue: 0,
                            cost: 0,
                        };
                        const partCost = part.price || 0;
                        vehicleProfitMap.set(vehicleId, {
                            revenue: current.revenue -
                                (item.unitPrice * item.quantity -
                                    item.discount),
                            cost: current.cost - partCost * item.quantity,
                        });
                    }
                }
                for (const [vehicleId, profitData,] of vehicleProfitMap.entries()) {
                    await this.updateVehicleProfit(vehicleId, profitData.revenue, profitData.cost, queryRunner.manager);
                }
            }
            await queryRunner.manager.remove(order_entity_1.Order, order);
            await this.sendOrderNotification(notification_enum_1.NotificationEnum.ORDER_CANCELLED, 'Order Deleted', `Order #${id} has been deleted`, order);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getStats() {
        const totalOrders = await this.orderRepository.count();
        const totalRevenueResult = await this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.totalAmount)', 'total')
            .where('order.status = :status', {
            status: entity_enum_1.OrderStatusEnum.COMPLETED,
        })
            .getRawOne();
        const totalRevenue = parseFloat(totalRevenueResult?.total || 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const pendingOrders = await this.orderRepository.count({
            where: { status: entity_enum_1.OrderStatusEnum.PENDING },
        });
        const completedOrders = await this.orderRepository.count({
            where: { status: entity_enum_1.OrderStatusEnum.COMPLETED },
        });
        const cancelledOrders = await this.orderRepository.count({
            where: { status: entity_enum_1.OrderStatusEnum.CANCELLED },
        });
        const statusCounts = await this.orderRepository
            .createQueryBuilder('order')
            .select('order.status', 'status')
            .addSelect('COUNT(order.id)', 'count')
            .groupBy('order.status')
            .getRawMany();
        const methodCounts = await this.orderRepository
            .createQueryBuilder('order')
            .select('order.deliveryMethod', 'method')
            .addSelect('COUNT(order.id)', 'count')
            .groupBy('order.deliveryMethod')
            .getRawMany();
        return {
            totalOrders,
            totalRevenue,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            ordersByStatus: statusCounts.map((item) => ({
                status: item.status,
                count: parseInt(item.count),
            })),
            ordersByDeliveryMethod: methodCounts.map((item) => ({
                method: item.method,
                count: parseInt(item.count),
            })),
            averageOrderValue,
        };
    }
    async generateReceipt(orderId) {
        const order = await this.findOneEntity(orderId);
        if (order.status !== entity_enum_1.OrderStatusEnum.COMPLETED) {
            throw new common_1.BadRequestException('Receipt can only be generated for completed orders');
        }
        const templateData = {
            order: this.mapToResponseDto(order),
            generatedAt: new Date().toLocaleString(),
            company: {
                name: 'Auto Parts Store',
                address: '123 Automotive Road, Car City, CC 12345',
                phone: '(555) 123-4567',
                email: 'info@autopartsstore.com',
                website: 'www.autopartsstore.com',
            },
        };
        return this.pdfService.generatePDF('order-receipt', templateData);
    }
    async updateVehicleProfit(vehicleId, revenue, cost, manager) {
        let vehicleProfit = await manager.findOne(vehicle_profit_entity_1.VehicleProfit, {
            where: { vehicle: { id: vehicleId } },
            relations: ['vehicle'],
        });
        if (!vehicleProfit) {
            vehicleProfit = this.vehicleProfitRepository.create({
                vehicle: { id: vehicleId },
                totalPartsRevenue: 0,
                totalPartsCost: 0,
                profit: 0,
                profitMargin: 0,
                isThresholdMet: false,
            });
        }
        vehicleProfit.totalPartsRevenue += revenue;
        vehicleProfit.totalPartsCost += cost;
        vehicleProfit.profit =
            vehicleProfit.totalPartsRevenue - vehicleProfit.totalPartsCost;
        if (vehicleProfit.totalPartsRevenue > 0) {
            vehicleProfit.profitMargin =
                (vehicleProfit.profit / vehicleProfit.totalPartsRevenue) * 100;
        }
        else {
            vehicleProfit.profitMargin = 0;
        }
        const PROFIT_THRESHOLD = 30;
        vehicleProfit.isThresholdMet =
            vehicleProfit.profitMargin >= PROFIT_THRESHOLD;
        await manager.save(vehicleProfit);
    }
    async sendOrderNotification(type, title, message, order) {
        try {
            await this.notificationsService.sendNotification({
                type,
                title,
                message,
                metadata: {
                    orderId: order.id,
                    customerName: order.customerName,
                    totalAmount: order.totalAmount,
                },
                audience: notification_enum_1.NotificationAudienceEnum.ADMIN,
                channel: notification_enum_1.NotificationChannelEnum.BOTH,
            });
        }
        catch (error) {
            console.error('Failed to send notification:', error);
        }
    }
    mapToResponseDto(order) {
        return {
            id: order.id,
            status: order.status,
            totalAmount: order.totalAmount,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerEmail: order.customerEmail,
            notes: order.notes,
            deliveryMethod: order.deliveryMethod,
            items: order.items?.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount,
                total: item.unitPrice * item.quantity - item.discount,
                part: {
                    id: item.part?.id,
                    name: item.part?.name,
                    description: item.part?.description,
                    price: item.part?.price,
                    quantity: item.part?.quantity,
                    condition: item.part?.condition,
                    partNumber: item.part?.partNumber,
                    vehicle: item.part?.vehicle
                        ? {
                            id: item.part.vehicle.id,
                            make: item.part.vehicle.make,
                            model: item.part.vehicle.model,
                            year: item.part.vehicle.year,
                        }
                        : undefined,
                    category: item.part?.category
                        ? {
                            id: item.part.category.id,
                            name: item.part.category.name,
                        }
                        : undefined,
                    images: item.part?.images?.map((img) => ({
                        id: img.id,
                        url: img.url,
                        publicId: img.publicId,
                        format: img.format,
                    })) || [],
                    vehicleId: item.part?.vehicle?.id,
                    categoryId: item.part?.category?.id,
                    createdAt: item.part?.createdAt,
                    updatedAt: item.part?.updatedAt,
                },
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            })) || [],
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(part_entity_1.Part)),
    __param(3, (0, typeorm_1.InjectRepository)(vehicle_profit_entity_1.VehicleProfit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService,
        pdf_service_1.PDFService])
], OrdersService);
//# sourceMappingURL=order.service.js.map