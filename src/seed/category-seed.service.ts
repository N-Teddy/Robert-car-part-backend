// src/seed/category-seed.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { seedCategoriesData } from './data/categories.data';

@Injectable()
export class CategorySeedService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async run() {
        const treeRepo = this.categoryRepository.manager.getTreeRepository(Category);

        // Ensure single ROOT category for nested-set
        let root = await this.categoryRepository.findOne({ where: { name: 'ROOT' } });
        if (!root) {
            root = this.categoryRepository.create({ name: 'ROOT', description: 'Root category' });
            root = await treeRepo.save(root);
        }

        // Reattach any existing root-level categories (parent IS NULL) under ROOT to avoid multiple roots
        const orphanRoots = await this.categoryRepository.find({ where: { parent: IsNull() } });
        for (const orphan of orphanRoots) {
            if (orphan.id === root.id || orphan.name === 'ROOT') continue;
            orphan.parent = root;
            await treeRepo.save(orphan);
        }

        // Upsert seed categories under ROOT
        for (const seed of seedCategoriesData) {
            let node = await this.categoryRepository.findOne({ where: { name: seed.name } });
            if (node) {
                node.parent = root;
                node.description = seed.description;
                await treeRepo.save(node);
            } else {
                node = this.categoryRepository.create({
                    name: seed.name,
                    description: seed.description,
                    parent: root,
                });
                await treeRepo.save(node);
            }
        }
    }
}