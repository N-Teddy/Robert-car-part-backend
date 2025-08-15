import { Order } from './order.entity';
import { Part } from './part.entity';
import { BaseEntity } from './base.entity';
export declare class OrderItem extends BaseEntity {
    quantity: number;
    unitPrice: number;
    discount: number;
    order: Order;
    part: Part;
}
