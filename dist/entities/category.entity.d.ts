import { Part } from './part.entity';
import { BaseEntity } from './base.entity';
import { Image } from './image.entity';
export declare class Category extends BaseEntity {
    name: string;
    description?: string;
    children: Category[];
    parent: Category;
    parentId: string;
    parts: Part[];
    image: Image;
}
