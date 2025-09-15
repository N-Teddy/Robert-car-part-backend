import { Response } from 'express';
import { OrdersService } from './order.service';
import { OrderResponseDto, OrderStatsResponseDto, PaginatedOrdersResponseDto } from 'src/dto/response/order.dto';
import { CreateOrderDto, OrderQueryDto, UpdateOrderDto } from 'src/dto/request/order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, req: any): Promise<OrderResponseDto>;
    findAll(query: OrderQueryDto): Promise<PaginatedOrdersResponseDto>;
    getStats(): Promise<OrderStatsResponseDto>;
    findOne(id: string): Promise<OrderResponseDto>;
    update(id: string, updateOrderDto: UpdateOrderDto, req: any): Promise<OrderResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    generateReceipt(id: string, res: Response): Promise<void>;
}
