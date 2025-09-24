import { DeliveryMethodEnum, OrderStatusEnum } from 'src/common/enum/entity.enum';
export declare class CreateOrderItemDto {
    partId: string;
    quantity: number;
    unitPrice?: number;
    discount?: number;
}
export declare class CreateOrderDto {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    notes?: string;
    deliveryMethod: DeliveryMethodEnum;
    items: CreateOrderItemDto[];
}
declare const UpdateOrderDto_base: import("@nestjs/common").Type<Partial<CreateOrderDto>>;
export declare class UpdateOrderDto extends UpdateOrderDto_base {
    status?: OrderStatusEnum;
}
export declare class OrderQueryDto {
    status?: OrderStatusEnum;
    deliveryMethod?: DeliveryMethodEnum;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export {};
