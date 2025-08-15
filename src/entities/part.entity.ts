import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { Category } from './category.entity';
import { OrderItem } from './order-item.entity';
import { Image } from './image.entity';
import { BaseEntity } from './base.entity';

@Entity('parts')
export class Part extends BaseEntity {
    @Column()
    @Index()
    name: string;

    @Column('text')
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column('int')
    quantity: number;

    @Column({ nullable: true })
    condition?: string;

    @Column({ nullable: true })
    @Index()
    partNumber?: string;

    @Column({ default: false })
    isFeatured: boolean;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.parts)
    vehicle: Vehicle;

    @ManyToOne(() => Category, (category) => category.parts)
    category: Category;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.part)
    orderItems: OrderItem[];

    @OneToMany(() => Image, (image) => image.part)
    images: Image[];
}