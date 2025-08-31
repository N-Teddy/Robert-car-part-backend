import { Part } from './part.entity';
import { BaseEntity } from './base.entity';
import { Image } from './image.entity';
export declare class Category extends BaseEntity {
    name: string;
    description?: string;
    slug: string;
    order: number;
    isActive: boolean;
    children: Category[];
    parent: Category;
    parentId: string;
    image?: Image;
    imageId?: string;
    parts: Part[];
    partCount?: number;
}
