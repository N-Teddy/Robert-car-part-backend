// src/entities/qr-code.entity.ts
import { Entity, Column, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Part } from './part.entity';
import { Image } from './image.entity'; // Add this import

@Entity('qr_codes')
export class QrCode extends BaseEntity {
	@Column({ nullable: true })
	data?: string; // optional: the encoded string (e.g., part ID, product link)

	@Column('text')
	encodedData: string;

	@OneToOne(() => Part, (part) => part.qrCode, {
		onDelete: 'CASCADE',
	})
	part: Part;

	// Add one-to-one relationship with Image (for storing the QR code image)
	@OneToOne(() => Image, (image) => image.qrCode, {
		nullable: true,
		onDelete: 'SET NULL', // Set image to null if qrCode is deleted
	})
	image?: Image; // This will store the actual QR code image
}
