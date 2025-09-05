import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Part } from './part.entity';

@Entity('qr_codes')
export class QrCode extends BaseEntity {
    @Column()
    url: string; // where the QR code image is stored (local or cloud)

    @Column({ nullable: true })
    data?: string; // optional: the encoded string (e.g., part ID, product link)

    @OneToOne(() => Part, (part) => part.qrCode, { onDelete: 'CASCADE' })
    @JoinColumn()
    part: Part;
}
