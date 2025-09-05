import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';
import { Part } from './part.entity';
import { BaseEntity } from './base.entity';
import { ImageEnum } from 'src/common/enum/entity.enum';
import { Category } from './category.entity';
import { QrCode } from './qr-code.entity';

@Entity('images')
export class Image extends BaseEntity {
	@Column()
	url: string;

	@Column({ type: 'enum', enum: ImageEnum })
	type: ImageEnum;

	@OneToOne(() => User, (user) => user.profileImage, {
		nullable: true,
		onDelete: 'CASCADE'
	})
	user?: User;

	@ManyToOne(() => Vehicle, (vehicle) => vehicle.images, { nullable: true })
	vehicle?: Vehicle;

	@ManyToOne(() => Part, (part) => part.images, { nullable: true })
	part?: Part;

	@OneToOne(() => Category, (category) => category.image, {
		nullable: true,
		onDelete: 'SET NULL', // Set category to null if image is deleted
	})
	category?: Category;

	@OneToOne(() => QrCode, (qrCode) => qrCode.image, {
		nullable: true,
		onDelete: 'SET NULL', // Set qrCode to null if image is deleted
	})
	qrCode?: QrCode;
}
