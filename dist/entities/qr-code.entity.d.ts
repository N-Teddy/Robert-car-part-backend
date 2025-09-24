import { BaseEntity } from './base.entity';
import { Part } from './part.entity';
import { Image } from './image.entity';
export declare class QrCode extends BaseEntity {
    data?: string;
    encodedData: string;
    part: Part;
    image?: Image;
}
