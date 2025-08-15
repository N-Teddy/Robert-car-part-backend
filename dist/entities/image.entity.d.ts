import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';
import { Part } from './part.entity';
import { BaseEntity } from './base.entity';
import { ImageEnum } from 'src/common/enum/entity.enum';
export declare class Image extends BaseEntity {
    url: string;
    type: ImageEnum;
    user?: User;
    vehicle?: Vehicle;
    part?: Part;
}
