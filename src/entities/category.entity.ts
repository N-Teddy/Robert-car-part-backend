// src/entities/category.entity.ts

import {
	Entity,
	Column,
	OneToMany,
	Tree,
	TreeChildren,
	TreeParent,
} from 'typeorm';
import { Part } from './part.entity';
import { BaseEntity } from './base.entity';

@Entity('categories')
@Tree('nested-set')
export class Category extends BaseEntity {
	@Column()
	name: string;

	@Column({ nullable: true })
	description?: string;

	@TreeChildren()
	children: Category[];

	@TreeParent()
	parent: Category;

	@OneToMany(() => Part, (part) => part.category)
	parts: Part[];
}
