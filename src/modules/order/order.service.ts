// src/orders/orders.service.ts
import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
	NotificationAudienceEnum,
	NotificationChannelEnum,
	NotificationEnum,
} from 'src/common/enum/notification.enum';
import { Order } from 'src/entities/order.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { Part } from 'src/entities/part.entity';
import {
	OrderResponseDto,
	OrderStatsResponseDto,
} from 'src/dto/response/order.dto';
import {
	CreateOrderDto,
	OrderQueryDto,
	UpdateOrderDto,
} from 'src/dto/request/order.dto';
import { OrderStatusEnum } from 'src/common/enum/entity.enum';
import { NotificationService } from '../notification/notification.service';
import { PDFService } from 'src/common/services/pdf.service';

@Injectable()
export class OrdersService {
	constructor(
		@InjectRepository(Order)
		private orderRepository: Repository<Order>,
		@InjectRepository(OrderItem)
		private orderItemRepository: Repository<OrderItem>,
		@InjectRepository(Part)
		private partRepository: Repository<Part>,
		private notificationsService: NotificationService,
		private pdfService: PDFService
	) {}

	async create(
		createOrderDto: CreateOrderDto,
		userId: string
	): Promise<OrderResponseDto> {
		const queryRunner =
			this.orderRepository.manager.connection.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// Calculate total amount
			let totalAmount = 0;
			const orderItems: OrderItem[] = [];

			for (const itemDto of createOrderDto.items) {
				const part = await queryRunner.manager.findOne(Part, {
					where: { id: itemDto.partId },
					relations: ['vehicle', 'category'],
				});

				if (!part) {
					throw new NotFoundException(
						`Part with ID ${itemDto.partId} not found`
					);
				}

				if (part.quantity < itemDto.quantity) {
					throw new BadRequestException(
						`Insufficient stock for part ${part.name}`
					);
				}

				// Use part price if unitPrice is not provided
				const unitPrice = itemDto.unitPrice || part.price;

				// Calculate item total
				const itemTotal =
					unitPrice * itemDto.quantity - (itemDto.discount || 0);
				totalAmount += itemTotal;

				// Create order item
				const orderItem = this.orderItemRepository.create({
					part: { id: itemDto.partId },
					quantity: itemDto.quantity,
					unitPrice,
					discount: itemDto.discount || 0,
					createdBy: userId,
				});

				orderItems.push(orderItem);

				// Update part quantity
				part.quantity -= itemDto.quantity;
				await queryRunner.manager.save(part);
			}

			// Create order
			const order = this.orderRepository.create({
				...createOrderDto,
				totalAmount,
				items: orderItems,
				createdBy: userId,
			});

			const savedOrder = await queryRunner.manager.save(order);

			// Send notification to admins only
			await this.sendOrderNotification(
				NotificationEnum.ORDER_CREATED,
				'New Order Created',
				`A new order #${savedOrder.id} has been created`,
				savedOrder
			);

			await queryRunner.commitTransaction();

			// Return the complete order with relations
			return this.mapToResponseDto(
				await this.findOneEntity(savedOrder.id)
			);
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async findAll(
		query: OrderQueryDto
	): Promise<{ data: OrderResponseDto[]; total: number }> {
		const {
			page,
			limit,
			status,
			deliveryMethod,
			customerName,
			customerPhone,
			customerEmail,
			startDate,
			endDate,
			sortBy,
			sortOrder,
		} = query;

		const skip = (page - 1) * limit;
		const where: any = {};

		if (status) where.status = status;
		if (deliveryMethod) where.deliveryMethod = deliveryMethod;
		if (customerName) where.customerName = customerName;
		if (customerPhone) where.customerPhone = customerPhone;
		if (customerEmail) where.customerEmail = customerEmail;

		// Date range filter
		if (startDate && endDate) {
			where.createdAt = Between(new Date(startDate), new Date(endDate));
		} else if (startDate) {
			where.createdAt = MoreThanOrEqual(new Date(startDate));
		} else if (endDate) {
			where.createdAt = LessThanOrEqual(new Date(endDate));
		}

		const [orders, total] = await this.orderRepository.findAndCount({
			where,
			relations: [
				'items',
				'items.part',
				'items.part.vehicle',
				'items.part.category',
			],
			order: { [sortBy]: sortOrder },
			skip,
			take: limit,
		});

		const data = orders.map((order) => this.mapToResponseDto(order));
		return { data, total };
	}

	async findOne(id: string): Promise<OrderResponseDto> {
		const order = await this.findOneEntity(id);
		return this.mapToResponseDto(order);
	}

	private async findOneEntity(id: string): Promise<Order> {
		const order = await this.orderRepository.findOne({
			where: { id },
			relations: [
				'items',
				'items.part',
				'items.part.vehicle',
				'items.part.category',
			],
		});

		if (!order) {
			throw new NotFoundException(`Order with ID ${id} not found`);
		}

		return order;
	}

	async update(
		id: string,
		updateOrderDto: UpdateOrderDto,
		userId: string
	): Promise<OrderResponseDto> {
		const order = await this.findOneEntity(id);
		const previousStatus = order.status;

		const updatedOrder = await this.orderRepository.save({
			...order,
			...updateOrderDto,
			updatedBy: userId,
		});

		// Send notification if status changed (to admins only)
		if (updateOrderDto.status && updateOrderDto.status !== previousStatus) {
			let notificationType: NotificationEnum;
			let title: string;
			let message: string;

			switch (updateOrderDto.status) {
				case OrderStatusEnum.COMPLETED:
					notificationType = NotificationEnum.ORDER_COMPLETED;
					title = 'Order Completed';
					message = `Order #${id} has been completed`;
					break;
				case OrderStatusEnum.CANCELLED:
					notificationType = NotificationEnum.ORDER_CANCELLED;
					title = 'Order Cancelled';
					message = `Order #${id} has been cancelled`;
					break;
				default:
					notificationType = NotificationEnum.ORDER_UPDATED;
					title = 'Order Updated';
					message = `Order #${id} has been updated`;
			}

			await this.sendOrderNotification(
				notificationType,
				title,
				message,
				updatedOrder
			);
		}

		return this.mapToResponseDto(await this.findOneEntity(id));
	}

	async remove(id: string): Promise<void> {
		const order = await this.findOneEntity(id);
		await this.orderRepository.remove(order);

		// Send notification to admins only
		await this.sendOrderNotification(
			NotificationEnum.ORDER_CANCELLED,
			'Order Deleted',
			`Order #${id} has been deleted`,
			order
		);
	}

	async getStats(): Promise<OrderStatsResponseDto> {
		const totalOrders = await this.orderRepository.count();

		const totalRevenueResult = await this.orderRepository
			.createQueryBuilder('order')
			.select('SUM(order.totalAmount)', 'total')
			.where('order.status = :status', {
				status: OrderStatusEnum.COMPLETED,
			})
			.getRawOne();

		const totalRevenue = parseFloat(totalRevenueResult?.total || 0);
		const averageOrderValue =
			totalOrders > 0 ? totalRevenue / totalOrders : 0;

		const pendingOrders = await this.orderRepository.count({
			where: { status: OrderStatusEnum.PENDING },
		});

		const completedOrders = await this.orderRepository.count({
			where: { status: OrderStatusEnum.COMPLETED },
		});

		const cancelledOrders = await this.orderRepository.count({
			where: { status: OrderStatusEnum.CANCELLED },
		});

		// Orders by status
		const statusCounts = await this.orderRepository
			.createQueryBuilder('order')
			.select('order.status', 'status')
			.addSelect('COUNT(order.id)', 'count')
			.groupBy('order.status')
			.getRawMany();

		// Orders by delivery method
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

	async generateReceipt(orderId: string): Promise<Buffer> {
		const order = await this.findOneEntity(orderId);

		if (order.status !== OrderStatusEnum.COMPLETED) {
			throw new BadRequestException(
				'Receipt can only be generated for completed orders'
			);
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

	private async sendOrderNotification(
		type: NotificationEnum,
		title: string,
		message: string,
		order: Order
	): Promise<void> {
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
				audience: NotificationAudienceEnum.ADMIN, // Only admins as requested
				channel: NotificationChannelEnum.BOTH,
			});
		} catch (error) {
			// Log error but don't fail the operation
			console.error('Failed to send notification:', error);
		}
	}

	private mapToResponseDto(order: Order): OrderResponseDto {
		return {
			id: order.id,
			status: order.status,
			totalAmount: order.totalAmount,
			customerName: order.customerName,
			customerPhone: order.customerPhone,
			customerEmail: order.customerEmail,
			notes: order.notes,
			deliveryMethod: order.deliveryMethod,
			items: order.items.map((item) => ({
				id: item.id,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				discount: item.discount,
				total: item.unitPrice * item.quantity - item.discount,
				part: {
					id: item.part.id,
					name: item.part.name,
					description: item.part.description,
					price: item.part.price,
					quantity: item.part.quantity,
					condition: item.part.condition,
					partNumber: item.part.partNumber,
					vehicle: item.part.vehicle
						? {
								id: item.part.vehicle.id,
								make: item.part.vehicle.make,
								model: item.part.vehicle.model,
								year: item.part.vehicle.year,
							}
						: undefined,
					category: item.part.category
						? {
								id: item.part.category.id,
								name: item.part.category.name,
							}
						: undefined,
					vehicleId: item.part.vehicle?.id,
					categoryId: item.part.category?.id,
					createdAt: item.part.createdAt,
					updatedAt: item.part.updatedAt,
				},
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			})),
			createdAt: order.createdAt,
			updatedAt: order.updatedAt,
		};
	}
}
