import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';
import { Part } from './part.entity';
import { Category } from './category.entity';
import { QrCode } from './qr-code.entity';
import { ImageEnum } from '../common/enum/entity.enum';

@Entity('images')
export class Image extends BaseEntity {
	@Column()
	url: string;

	@Column({ nullable: true })
	publicId: string;

	@Column({ nullable: true })
	format: string;

	@Column({ type: 'int', nullable: true })
	size: number;

	@Column({
		type: 'enum',
		enum: ImageEnum,
	})
	type: ImageEnum;


	@ManyToOne(() => User, (user) => user.profileImage, { nullable: true, onDelete: 'CASCADE' })
	user: User;

	@ManyToOne(() => Vehicle, (vehicle) => vehicle.images, { nullable: true, onDelete: 'CASCADE' })
	vehicle: Vehicle;

	@ManyToOne(() => Part, (part) => part.images, { nullable: true, onDelete: 'CASCADE' })
	part: Part;

	// One-to-One relationship with Category
	@OneToOne(() => Category, (category) => category.image, { nullable: true, onDelete: 'CASCADE' })
	category: Category;

	@OneToOne(() => QrCode, (qrCode) => qrCode.image, { nullable: true, onDelete: 'CASCADE' })
	qrCode: QrCode;
}
