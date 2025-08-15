import { Entity, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Part } from './part.entity';
import { BaseEntity } from './base.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
    @Column('int')
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    unitPrice: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    discount: number;

    @ManyToOne(() => Order, (order) => order.items)
    order: Order;

    @ManyToOne(() => Part, (part) => part.orderItems)
    part: Part;
}