import { Entity, Column, OneToMany, Index } from 'typeorm';
import { OrderItem } from './order-item.entity';
import {
	DeliveryMethodEnum,
	OrderStatusEnum,
} from '../common/enum/entity.enum';
import { BaseEntity } from './base.entity';

@Entity('orders')
export class Order extends BaseEntity {
	@Column({
		type: 'enum',
		enum: OrderStatusEnum,
		default: OrderStatusEnum.PENDING,
	})
	@Index()
	status: OrderStatusEnum;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	totalAmount: number;

	@Column({ nullable: true })
	@Index()
	customerName?: string;

	@Column({ nullable: true })
	@Index()
	customerPhone?: string;

	@Column({ nullable: true })
	@Index()
	customerEmail?: string;

	@Column({ type: 'text', nullable: true })
	notes?: string;

	@Column({
		type: 'enum',
		enum: DeliveryMethodEnum,
		default: DeliveryMethodEnum.PICKUP,
	})
	deliveryMethod: DeliveryMethodEnum;

	@OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
		cascade: true,
	})
	items: OrderItem[];
}
