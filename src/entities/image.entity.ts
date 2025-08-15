import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';
import { Part } from './part.entity';
import { BaseEntity } from './base.entity';
import { ImageEnum } from 'src/common/enum/entity.enum';


@Entity('images')
export class Image extends BaseEntity {
    @Column()
    url: string;

    @Column({ type: 'enum', enum: ImageEnum })
    type: ImageEnum;

    @ManyToOne(() => User, (user) => user.profileImage, { nullable: true })
    user?: User;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.images, { nullable: true })
    vehicle?: Vehicle;

    @ManyToOne(() => Part, (part) => part.images, { nullable: true })
    part?: Part;
}