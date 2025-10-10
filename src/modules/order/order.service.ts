// src/orders/orders.service.ts
import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	Repository,
	Between,
	LessThanOrEqual,
	MoreThanOrEqual,
	In,
} from 'typeorm';
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
import { VehicleProfit } from 'src/entities/vehicle-profit.entity';

@Injectable()
export class OrdersService {
	constructor(
		@InjectRepository(Order)
		private orderRepository: Repository<Order>,
		@InjectRepository(OrderItem)
		private orderItemRepository: Repository<OrderItem>,
		@InjectRepository(Part)
		private partRepository: Repository<Part>,
		@InjectRepository(VehicleProfit) // Add this repository
		private vehicleProfitRepository: Repository<VehicleProfit>,
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
			let totalAmount = 0;
			const orderItems: OrderItem[] = [];
			const vehicleProfitMap = new Map<
				string,
				{ revenue: number; cost: number }
			>();

			// Load all parts in a single query for better performance
			const partIds = createOrderDto.items.map((item) => item.partId);
			const parts = await queryRunner.manager.find(Part, {
				where: { id: In(partIds) },
				relations: ['vehicle', 'category'], // Only load needed relations
			});

			const partMap = new Map(parts.map((part) => [part.id, part]));

			for (const itemDto of createOrderDto.items) {
				const part = partMap.get(itemDto.partId);

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

				const unitPrice = itemDto.unitPrice || part.price;
				const itemTotal =
					unitPrice * itemDto.quantity - (itemDto.discount || 0);
				totalAmount += itemTotal;

				// Create order item
				const orderItem = this.orderItemRepository.create({
					part: part,
					quantity: itemDto.quantity,
					unitPrice,
					discount: itemDto.discount || 0,
					createdBy: userId,
				});

				orderItems.push(orderItem);

				// Update part quantity - FIXED: Only update the quantity field
				await queryRunner.manager.update(
					Part,
					{ id: part.id },
					{ quantity: part.quantity - itemDto.quantity }
				);

				// Track profit by vehicle
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

			// Create order
			const order = this.orderRepository.create({
				...createOrderDto,
				totalAmount,
				items: orderItems,
				createdBy: userId,
			});

			const savedOrder = await queryRunner.manager.save(order);

			// Update vehicle profit records
			for (const [vehicleId, profitData] of vehicleProfitMap.entries()) {
				await this.updateVehicleProfit(
					vehicleId,
					profitData.revenue,
					profitData.cost,
					queryRunner.manager
				);
			}

			// Send notification
			await this.sendOrderNotification(
				NotificationEnum.ORDER_CREATED,
				'New Order Created',
				`A new order #${savedOrder.id} has been created`,
				savedOrder
			);

			await queryRunner.commitTransaction();

			// Return the complete order with explicit relations
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
				'items.part.images'
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
				'items.part.images'
			],
		});

		if (!order) {
			throw new NotFoundException(`Order with ID ${id} not found`);
		}

		return order;
	}

	// Update the update method to handle profit recalculation when order status changes
	async update(
		id: string,
		updateOrderDto: UpdateOrderDto,
		userId: string
	): Promise<OrderResponseDto> {
		const queryRunner =
			this.orderRepository.manager.connection.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const order = await this.findOneEntity(id);
			const previousStatus = order.status;

			const { items, ...orderUpdateData } = updateOrderDto;

			// If status is changing to/from COMPLETED, we need to update vehicle profits
			const shouldUpdateProfits =
				(updateOrderDto.status === OrderStatusEnum.COMPLETED &&
					previousStatus !== OrderStatusEnum.COMPLETED) ||
				(previousStatus === OrderStatusEnum.COMPLETED &&
					updateOrderDto.status !== OrderStatusEnum.COMPLETED);

			const updatedOrder = await queryRunner.manager.save(Order, {
				...order,
				...updateOrderDto,
				updatedBy: userId,
			});

			if (items && items.length > 0) {
				// Remove existing items
				await queryRunner.manager.delete(OrderItem, { order: { id } });

				// Create new items
				const orderItems = items.map(item =>
					queryRunner.manager.create(OrderItem, {
						...item,
						order: { id },
						part: { id: item.partId }
					})
				);

				await queryRunner.manager.save(OrderItem, orderItems);
			}

			// Update vehicle profits if needed
			if (shouldUpdateProfits) {
				const vehicleProfitMap = new Map<
					string,
					{ revenue: number; cost: number }
				>();

				for (const item of order.items) {
					const part = await queryRunner.manager.findOne(Part, {
						where: { id: item.part.id },
						relations: ['vehicle'],
					});

					if (part && part.vehicle) {
						const vehicleId = part.vehicle.id;
						const current = vehicleProfitMap.get(vehicleId) || {
							revenue: 0,
							cost: 0,
						};

						// Calculate the multiplier based on status change direction
						const multiplier =
							updateOrderDto.status === OrderStatusEnum.COMPLETED
								? 1
								: -1;

						// Calculate part cost (assuming part.cost is the purchase cost)
						const partCost = part.price || 0;

						vehicleProfitMap.set(vehicleId, {
							revenue:
								current.revenue +
								multiplier *
									(item.unitPrice * item.quantity -
										item.discount),
							cost:
								current.cost +
								multiplier * (partCost * item.quantity),
						});
					}
				}

				// Update vehicle profit records
				for (const [
					vehicleId,
					profitData,
				] of vehicleProfitMap.entries()) {
					await this.updateVehicleProfit(
						vehicleId,
						profitData.revenue,
						profitData.cost,
						queryRunner.manager
					);
				}
			}

			// Send notification if status changed (to admins only)
			if (
				updateOrderDto.status &&
				updateOrderDto.status !== previousStatus
			) {
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

			await queryRunner.commitTransaction();
			return this.mapToResponseDto(await this.findOneEntity(id));
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	// Update the remove method to handle profit recalculation
	async remove(id: string): Promise<void> {
		const queryRunner =
			this.orderRepository.manager.connection.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const order = await this.findOneEntity(id);

			// If order was completed, we need to subtract from vehicle profits
			if (order.status === OrderStatusEnum.COMPLETED) {
				const vehicleProfitMap = new Map<
					string,
					{ revenue: number; cost: number }
				>();

				for (const item of order.items) {
					const part = await queryRunner.manager.findOne(Part, {
						where: { id: item.part.id },
						relations: ['vehicle'],
					});

					if (part && part.vehicle) {
						const vehicleId = part.vehicle.id;
						const current = vehicleProfitMap.get(vehicleId) || {
							revenue: 0,
							cost: 0,
						};

						// Calculate part cost (assuming part.cost is the purchase cost)
						const partCost = part.price || 0;

						vehicleProfitMap.set(vehicleId, {
							revenue:
								current.revenue -
								(item.unitPrice * item.quantity -
									item.discount),
							cost: current.cost - partCost * item.quantity,
						});
					}
				}

				// Update vehicle profit records
				for (const [
					vehicleId,
					profitData,
				] of vehicleProfitMap.entries()) {
					await this.updateVehicleProfit(
						vehicleId,
						profitData.revenue,
						profitData.cost,
						queryRunner.manager
					);
				}
			}

			await queryRunner.manager.remove(Order, order);

			// Send notification to admins only
			await this.sendOrderNotification(
				NotificationEnum.ORDER_CANCELLED,
				'Order Deleted',
				`Order #${id} has been deleted`,
				order
			);

			await queryRunner.commitTransaction();
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
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

	private async updateVehicleProfit(
		vehicleId: string,
		revenue: number,
		cost: number,
		manager: any
	): Promise<void> {
		// Find or create vehicle profit record
		let vehicleProfit = await manager.findOne(VehicleProfit, {
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

		// Update profit data
		vehicleProfit.totalPartsRevenue += revenue;
		vehicleProfit.totalPartsCost += cost;
		vehicleProfit.profit =
			vehicleProfit.totalPartsRevenue - vehicleProfit.totalPartsCost;

		// Calculate profit margin (avoid division by zero)
		if (vehicleProfit.totalPartsRevenue > 0) {
			vehicleProfit.profitMargin =
				(vehicleProfit.profit / vehicleProfit.totalPartsRevenue) * 100;
		} else {
			vehicleProfit.profitMargin = 0;
		}

		// Check if profit threshold is met (example: at least 30% margin)
		const PROFIT_THRESHOLD = 30;
		vehicleProfit.isThresholdMet =
			vehicleProfit.profitMargin >= PROFIT_THRESHOLD;

		await manager.save(vehicleProfit);
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
			items:
				order.items?.map((item) => ({
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
}
