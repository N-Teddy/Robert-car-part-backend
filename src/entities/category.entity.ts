// src/entities/category.entity.ts
import {
	Entity,
	Column,
	OneToMany,
	Tree,
	TreeChildren,
	TreeParent,
	ManyToOne,
	JoinColumn,
	Index,
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

	@Column({ unique: true }) // Slug should be globally unique
	slug: string;

	@Column({ default: 0 })
	order: number;

	@Column({ default: true })
	isActive: boolean;

	@TreeChildren()
	children: Category[];

	@TreeParent()
	parent: Category;

	@Column({ nullable: true })
	parentId: string;

	@ManyToOne(() => Image, { nullable: true })
	@JoinColumn()
	image?: Image;

	@Column({ nullable: true })
	imageId?: string;

	@OneToMany(() => Part, (part) => part.category)
	parts: Part[];

	// Virtual field for part count (not stored in DB)
	partCount?: number;
}