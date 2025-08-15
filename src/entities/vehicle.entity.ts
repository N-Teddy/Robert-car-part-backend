import { Entity, Column, OneToMany, Index } from 'typeorm';
import { Part } from './part.entity';
import { VehicleProfit } from './vehicle-profit.entity';
import { Image } from './image.entity';
import { BaseEntity } from './base.entity';

@Entity('vehicles')
export class Vehicle extends BaseEntity {
    @Column()
    @Index()
    make: string;

    @Column()
    @Index()
    model: string;

    @Column({ type: 'smallint' })
    year: number;

    @Column({ unique: true })
    @Index()
    vin: string;

    @Column('text')
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    purchasePrice: number;

    @Column('date')
    purchaseDate: Date;

    @Column({ nullable: true })
    auctionName?: string;

    @Column({ default: false })
    isPartedOut: boolean;

    @OneToMany(() => Part, (part) => part.vehicle)
    parts: Part[];

    @OneToMany(() => VehicleProfit, (profit) => profit.vehicle)
    profitRecords: VehicleProfit[];

    @OneToMany(() => Image, (image) => image.vehicle)
    images: Image[];
}