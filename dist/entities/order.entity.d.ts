import { OrderItem } from './order-item.entity';
import { DeliveryMethodEnum, OrderStatusEnum } from '../common/enum/entity.enum';
import { BaseEntity } from './base.entity';
export declare class Order extends BaseEntity {
    status: OrderStatusEnum;
    totalAmount: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    notes?: string;
    deliveryMethod: DeliveryMethodEnum;
    items: OrderItem[];
}
