import { Repository } from 'typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { OrderResponseDto, OrderStatsResponseDto } from 'src/dto/response/order.dto';
import { CreateOrderDto, OrderQueryDto, UpdateOrderDto } from 'src/dto/request/order.dto';
import { NotificationService } from '../notification/notification.service';
import { PDFService } from 'src/common/services/pdf.service';
import { VehicleProfit } from 'src/entities/vehicle-profit.entity';
export declare class OrdersService {
    private orderRepository;
    private orderItemRepository;
    private vehicleProfitRepository;
    private notificationsService;
    private pdfService;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, vehicleProfitRepository: Repository<VehicleProfit>, notificationsService: NotificationService, pdfService: PDFService);
    create(createOrderDto: CreateOrderDto, userId: string): Promise<OrderResponseDto>;
    findAll(query: OrderQueryDto): Promise<{
        data: OrderResponseDto[];
        total: number;
    }>;
    findOne(id: string): Promise<OrderResponseDto>;
    private findOneEntity;
    update(id: string, updateOrderDto: UpdateOrderDto, userId: string): Promise<OrderResponseDto>;
    remove(id: string): Promise<void>;
    getStats(): Promise<OrderStatsResponseDto>;
    generateReceipt(orderId: string): Promise<Buffer>;
    private updateVehicleProfit;
    private sendOrderNotification;
    private mapToResponseDto;
}
