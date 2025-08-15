import { Entity, Column, ManyToOne } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { BaseEntity } from './base.entity';

@Entity('vehicle_profits')
export class VehicleProfit extends BaseEntity {
    @Column('decimal', { precision: 10, scale: 2 })
    totalPartsRevenue: number;

    @Column('decimal', { precision: 10, scale: 2 })
    totalPartsCost: number;

    @Column('decimal', { precision: 10, scale: 2 })
    profit: number;

    @Column('decimal', { precision: 5, scale: 2 })
    profitMargin: number;

    @Column({ default: false })
    isThresholdMet: boolean;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.profitRecords)
    vehicle: Vehicle;
}