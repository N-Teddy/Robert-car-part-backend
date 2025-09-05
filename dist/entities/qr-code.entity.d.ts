import { BaseEntity } from './base.entity';
import { Part } from './part.entity';
export declare class QrCode extends BaseEntity {
    url: string;
    data?: string;
    part: Part;
}
