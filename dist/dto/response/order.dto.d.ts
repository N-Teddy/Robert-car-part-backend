import { OrderStatusEnum, DeliveryMethodEnum } from 'src/common/enum/entity.enum';
import { PartResponseDto } from './part.dto';
export declare class OrderItemResponseDto {
    id: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
    part: PartResponseDto;
    createdAt: Date;
    updatedAt: Date;
}
export declare class OrderResponseDto {
    id: string;
    status: OrderStatusEnum;
    totalAmount: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    notes?: string;
    deliveryMethod: DeliveryMethodEnum;
    items: OrderItemResponseDto[];
    createdAt: Date;
    updatedAt: Date;
}
declare class StatusCountDto {
    status: string;
    count: number;
}
declare class MethodCountDto {
    method: string;
    count: number;
}
export declare class OrderStatsResponseDto {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    ordersByStatus: StatusCountDto[];
    ordersByDeliveryMethod: MethodCountDto[];
    averageOrderValue: number;
}
declare class MetaDto {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class PaginatedOrdersResponseDto {
    items: OrderResponseDto[];
    meta: MetaDto;
}
export {};
