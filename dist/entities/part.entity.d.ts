import { Vehicle } from './vehicle.entity';
import { Category } from './category.entity';
import { OrderItem } from './order-item.entity';
import { Image } from './image.entity';
import { BaseEntity } from './base.entity';
import { QrCode } from './qr-code.entity';
export declare class Part extends BaseEntity {
    name: string;
    description: string;
    price: number;
    quantity: number;
    condition?: string;
    partNumber?: string;
    isFeatured: boolean;
    vehicle: Vehicle;
    category: Category;
    orderItems: OrderItem[];
    images: Image[];
    qrCode: QrCode;
}
