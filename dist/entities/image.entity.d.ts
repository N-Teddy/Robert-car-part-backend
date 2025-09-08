import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';
import { Part } from './part.entity';
import { Category } from './category.entity';
import { QrCode } from './qr-code.entity';
import { ImageEnum } from '../common/enum/entity.enum';
export declare class Image extends BaseEntity {
    url: string;
    publicId: string;
    format: string;
    size: number;
    type: ImageEnum;
    user: User;
    vehicle: Vehicle;
    part: Part;
    category: Category;
    qrCode: QrCode;
}
