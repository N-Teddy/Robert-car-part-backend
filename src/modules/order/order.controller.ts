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
    UseInterceptors,
    Res,
    HttpStatus,
    UseGuards
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { UserRoleEnum } from 'src/common/enum/entity.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrdersService } from './order.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { OrderResponseDto, OrderStatsResponseDto, PaginatedOrdersResponseDto } from 'src/dto/response/order.dto';
import { CreateOrderDto, OrderQueryDto, UpdateOrderDto } from 'src/dto/request/order.dto';

@ApiTags('Orders')
@Controller('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new order' })
    @ApiResponse({ status: 201, description: 'Order created successfully', type: OrderResponseDto })
    @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.STAFF, UserRoleEnum.SALES, UserRoleEnum.ADMIN)
    async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
        return this.ordersService.create(createOrderDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all orders with pagination and filtering' })
    @ApiResponse({ status: 200, description: 'Orders retrieved successfully', type: PaginatedOrdersResponseDto })
    @Roles(UserRoleEnum.STAFF, UserRoleEnum.SALES, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN)
    async findAll(@Query() query: OrderQueryDto): Promise<PaginatedOrdersResponseDto> {
        const result = await this.ordersService.findAll(query);

        return {
            items: result.data,
            meta: {
                total: result.total,
                page: query.page,
                limit: query.limit,
                totalPages: Math.ceil(result.total / query.limit),
                hasNext: query.page < Math.ceil(result.total / query.limit),
                hasPrev: query.page > 1
            }
        };
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get order statistics' })
    @ApiResponse({ status: 200, description: 'Order statistics retrieved', type: OrderStatsResponseDto })
    @Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN)
    async getStats(): Promise<OrderStatsResponseDto> {
        return this.ordersService.getStats();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific order by ID' })
    @ApiResponse({ status: 200, description: 'Order retrieved successfully', type: OrderResponseDto })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @Roles(UserRoleEnum.STAFF, UserRoleEnum.SALES, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN)
    async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
        return this.ordersService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an order' })
    @ApiResponse({ status: 200, description: 'Order updated successfully', type: OrderResponseDto })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @Roles(UserRoleEnum.STAFF, UserRoleEnum.SALES, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN)
    async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto> {
        return this.ordersService.update(id, updateOrderDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an order' })
    @ApiResponse({ status: 200, description: 'Order deleted successfully' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @Roles(UserRoleEnum.MANAGER, UserRoleEnum.ADMIN)
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        await this.ordersService.remove(id);
        return { message: 'Order deleted successfully' };
    }

    @Get(':id/receipt')
    @ApiOperation({ summary: 'Generate and download order receipt PDF' })
    @ApiResponse({ status: 200, description: 'PDF receipt generated' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.STAFF, UserRoleEnum.SALES, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN)
    async generateReceipt(@Param('id') id: string, @Res() res: Response): Promise<void> {
        const pdfBuffer = await this.ordersService.generateReceipt(id);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=order-${id}-receipt.pdf`);
        res.send(pdfBuffer);
    }
}