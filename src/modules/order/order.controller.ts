// src/orders/orders.controller.ts
import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	Res,
	UseGuards,
	Req,
} from '@nestjs/common';

import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';

import { UserRoleEnum } from 'src/common/enum/entity.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrdersService } from './order.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import {
	OrderResponseDto,
	OrderStatsResponseDto,
	PaginatedOrdersResponseDto,
} from 'src/dto/response/order.dto';
import {
	CreateOrderDto,
	OrderQueryDto,
	UpdateOrderDto,
} from 'src/dto/request/order.dto';

@ApiTags('Orders')
@Controller('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new order' })
	@ApiResponse({ status: 201, type: OrderResponseDto })
	@Roles(
		UserRoleEnum.CUSTOMER,
		UserRoleEnum.STAFF,
		UserRoleEnum.SALES,
		UserRoleEnum.ADMIN,
		UserRoleEnum.DEV
	)
	async create(
		@Body() createOrderDto: CreateOrderDto,
		@Req() req: any
	): Promise<OrderResponseDto> {
		return this.ordersService.create(createOrderDto, req.user.id);
	}

	@Get()
	@ApiOperation({ summary: 'Get all orders with pagination and filtering' })
	@ApiResponse({ status: 200, type: PaginatedOrdersResponseDto })
	@Roles(
		UserRoleEnum.STAFF,
		UserRoleEnum.SALES,
		UserRoleEnum.MANAGER,
		UserRoleEnum.ADMIN,
		UserRoleEnum.DEV
	)
	async findAll(
		@Query() query: OrderQueryDto
	): Promise<PaginatedOrdersResponseDto> {
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

	@Get('stats')
	@ApiOperation({ summary: 'Get order statistics' })
	@ApiResponse({ status: 200, type: OrderStatsResponseDto })
	@Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN, UserRoleEnum.DEV)
	async getStats(): Promise<OrderStatsResponseDto> {
		return this.ordersService.getStats();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a specific order by ID' })
	@ApiResponse({ status: 200, type: OrderResponseDto })
	@ApiParam({ name: 'id', description: 'Order ID' })
	@Roles(
		UserRoleEnum.STAFF,
		UserRoleEnum.SALES,
		UserRoleEnum.MANAGER,
		UserRoleEnum.ADMIN,
		UserRoleEnum.DEV,
	)
	async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
		return this.ordersService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update an order' })
	@ApiResponse({ status: 200, type: OrderResponseDto })
	@ApiParam({ name: 'id', description: 'Order ID' })
	@Roles(
		UserRoleEnum.STAFF,
		UserRoleEnum.SALES,
		UserRoleEnum.MANAGER,
		UserRoleEnum.ADMIN,
		UserRoleEnum.DEV
	)
	async update(
		@Param('id') id: string,
		@Body() updateOrderDto: UpdateOrderDto,
		@Req() req: any
	): Promise<OrderResponseDto> {
		return this.ordersService.update(id, updateOrderDto, req.user.id);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete an order' })
	@ApiParam({ name: 'id', description: 'Order ID' })
	@Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN, UserRoleEnum.DEV)
	async remove(@Param('id') id: string): Promise<{ message: string }> {
		await this.ordersService.remove(id);
		return { message: 'Order deleted successfully' };
	}

	@Get(':id/receipt')
	@ApiOperation({ summary: 'Generate and download order receipt PDF' })
	@ApiParam({ name: 'id', description: 'Order ID' })
	@Roles(
		UserRoleEnum.CUSTOMER,
		UserRoleEnum.STAFF,
		UserRoleEnum.SALES,
		UserRoleEnum.MANAGER,
		UserRoleEnum.ADMIN,
		UserRoleEnum.DEV
	)
	async generateReceipt(
		@Param('id') id: string,
		@Res() res: Response
	): Promise<void> {
		const pdfBuffer = await this.ordersService.generateReceipt(id);

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename=order-${id}-receipt.pdf`
		);
		res.send(pdfBuffer);
	}
}
