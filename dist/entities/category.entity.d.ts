import { Part } from './part.entity';
import { BaseEntity } from './base.entity';
export declare class Category extends BaseEntity {
    name: string;
    description?: string;
    children: Category[];
    parent: Category;
    parts: Part[];
}
