import { Repository } from 'typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { Part } from 'src/entities/part.entity';
import { OrderResponseDto, OrderStatsResponseDto } from 'src/dto/response/order.dto';
import { CreateOrderDto, OrderQueryDto, UpdateOrderDto } from 'src/dto/request/order.dto';
import { NotificationService } from '../notification/notification.service';
export declare class OrdersService {
    private orderRepository;
    private orderItemRepository;
    private partRepository;
    private notificationsService;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, partRepository: Repository<Part>, notificationsService: NotificationService);
    create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto>;
    findAll(query: OrderQueryDto): Promise<{
        data: OrderResponseDto[];
        total: number;
    }>;
    findOne(id: string): Promise<OrderResponseDto>;
    private findOneEntity;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto>;
    remove(id: string): Promise<void>;
    getStats(): Promise<OrderStatsResponseDto>;
    generateReceipt(orderId: string): Promise<Buffer>;
    private sendOrderNotification;
    private mapToResponseDto;
}
