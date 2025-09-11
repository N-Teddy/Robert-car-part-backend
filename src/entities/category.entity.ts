// src/entities/category.entity.ts
import {
	Entity,
	Column,
	OneToMany,
	Tree,
	TreeChildren,
	TreeParent,
	Index,
	OneToOne, // Add this import
} from 'typeorm';
import { Part } from './part.entity';
import { BaseEntity } from './base.entity';
import { Image } from './image.entity';

@Entity('categories')
@Tree('nested-set')
export class Category extends BaseEntity {
	@Column()
	@Index() // For faster searching
	name: string;

	@Column({ nullable: true })
	description?: string;

	@Column({ default: true })
	isActive: boolean;

	@TreeChildren()
	children: Category[];

	@TreeParent()
	parent: Category;

	@Column({ nullable: true })
	parentId: string;

	@OneToMany(() => Part, (part) => part.category, { onDelete: 'CASCADE' })
	parts: Part[];

	// Add one-to-one relationship with Image
	@OneToOne(() => Image, (image) => image.category, {
		nullable: true,
		onDelete: 'CASCADE',
	})
	image: Image;
}