// src/modules/category/category.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, DataSource, Like, FindOptionsWhere } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CategoryResponseDto } from 'src/dto/response/category.dto';
import { CategoryTreeDto, CreateCategoryDto, UpdateCategoryDto } from 'src/dto/request/category.dto';
import { Part } from 'src/entities/part.entity';
import { CategoryQueryDto } from '../../dto/request/category.dto';


@Injectable()
export class CategoryService {
    private treeRepository: TreeRepository<Category>;

    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        private dataSource: DataSource
    ) {
        this.treeRepository = dataSource.getTreeRepository(Category);
    }

    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { parentId, ...categoryData } = createCategoryDto;

            // Generate slug first
            const slug = this.generateSlug(categoryData.name);

            // Check if slug already exists (must be globally unique)
            const existingSlug = await this.categoryRepository.findOne({
                where: { slug }
            });

            if (existingSlug) {
                throw new BadRequestException('Category slug already exists');
            }

            const category = this.categoryRepository.create({
                ...categoryData,
                slug
            });

            // Set parent if provided
            if (parentId) {
                const parent = await this.categoryRepository.findOne({
                    where: { id: parentId }
                });

                if (!parent) {
                    throw new NotFoundException('Parent category not found');
                }

                // Check if name is unique within the same parent
                const existingName = await this.categoryRepository.findOne({
                    where: {
                        name: categoryData.name,
                        parentId: parentId
                    }
                });

                if (existingName) {
                    throw new BadRequestException('Category name already exists under this parent');
                }

                category.parent = parent;
            } else {
                // Check if name is unique at root level
                const existingName = await this.categoryRepository.findOne({
                    where: {
                        name: categoryData.name,
                        parentId: null
                    }
                });

                if (existingName) {
                    throw new BadRequestException('Category name already exists at root level');
                }
            }

            const savedCategory = await queryRunner.manager.save(category);
            await queryRunner.commitTransaction();

            const partCount = await this.getPartCount(savedCategory.id);
            return new CategoryResponseDto({ ...savedCategory, partCount });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(query: CategoryQueryDto): Promise<{ data: CategoryResponseDto[]; total: number }> {
        const { page, limit, sortBy, sortOrder, ...filters } = query;
        const skip = (page - 1) * limit;

        const where: FindOptionsWhere<Category> = {};

        if (filters.name) {
            where.name = Like(`%${filters.name}%`);
        }

        if (filters.parentId !== undefined) {
            where.parentId = filters.parentId;
        }

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        const [categories, total] = await this.categoryRepository.findAndCount({
            where,
            relations: ['image'],
            order: { [sortBy]: sortOrder },
            skip,
            take: limit,
        });

        // Add part counts
        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const partCount = await this.getPartCount(category.id);
                return { ...category, partCount };
            })
        );

        return {
            data: categoriesWithCounts.map(category => new CategoryResponseDto(category)),
            total
        };
    }

    async findOne(id: string): Promise<CategoryResponseDto> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['parent', 'children', 'image']
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const partCount = await this.getPartCount(id);
        return new CategoryResponseDto({ ...category, partCount });
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const category = await this.categoryRepository.findOne({
                where: { id },
                relations: ['parent']
            });

            if (!category) {
                throw new NotFoundException('Category not found');
            }

            // Handle name changes
            if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
                // Check if name is unique within the same parent level
                const existingName = await this.categoryRepository.findOne({
                    where: {
                        name: updateCategoryDto.name,
                        parentId: category.parentId
                    }
                });

                if (existingName && existingName.id !== id) {
                    throw new BadRequestException('Category name already exists at this level');
                }

                // Update slug if name changed
                category.slug = this.generateSlug(updateCategoryDto.name);
            }

            // Handle parent changes
            if (updateCategoryDto.parentId !== undefined) {
                if (updateCategoryDto.parentId === null) {
                    // Moving to root level
                    category.parent = null;
                    category.parentId = null;
                } else if (updateCategoryDto.parentId !== category.parentId) {
                    const newParent = await this.categoryRepository.findOne({
                        where: { id: updateCategoryDto.parentId }
                    });

                    if (!newParent) {
                        throw new NotFoundException('New parent category not found');
                    }

                    // Check for circular reference
                    if (await this.isCircularReference(id, updateCategoryDto.parentId)) {
                        throw new BadRequestException('Circular reference detected');
                    }

                    // Check if name is unique in new parent
                    const existingName = await this.categoryRepository.findOne({
                        where: {
                            name: category.name,
                            parentId: updateCategoryDto.parentId
                        }
                    });

                    if (existingName && existingName.id !== id) {
                        throw new BadRequestException('Category name already exists under the new parent');
                    }

                    category.parent = newParent;
                }
            }

            // Update other fields
            Object.assign(category, updateCategoryDto);

            const updatedCategory = await queryRunner.manager.save(category);
            await queryRunner.commitTransaction();

            const partCount = await this.getPartCount(id);
            return new CategoryResponseDto({ ...updatedCategory, partCount });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async remove(id: string): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['children', 'parts']
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        // Check if category has children
        if (category.children && category.children.length > 0) {
            throw new BadRequestException('Cannot delete category with children');
        }

        // Check if category has parts
        const partCount = await this.getPartCount(id);
        if (partCount > 0) {
            throw new BadRequestException('Cannot delete category with associated parts');
        }

        await this.categoryRepository.remove(category);
    }

    async getTree(): Promise<CategoryTreeDto[]> {
        const trees = await this.treeRepository.findTrees({
            relations: ['image']
        });

        // Add part counts to each node
        const treesWithCounts = await Promise.all(
            trees.map(async (tree) => {
                const treeWithCounts = await this.addPartCountsToTree(tree);
                return new CategoryTreeDto(treeWithCounts);
            })
        );

        return treesWithCounts;
    }

    async getDescendants(id: string): Promise<CategoryTreeDto[]> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const descendants = await this.treeRepository.findDescendantsTree(category, {
            relations: ['image']
        });

        const descendantsWithCounts = await this.addPartCountsToTree(descendants);
        return [new CategoryTreeDto(descendantsWithCounts)];
    }

    async getAncestors(id: string): Promise<CategoryResponseDto[]> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const ancestors = await this.treeRepository.findAncestors(category, {
            relations: ['image']
        });

        const ancestorsWithCounts = await Promise.all(
            ancestors.map(async (ancestor) => {
                const partCount = await this.getPartCount(ancestor.id);
                return { ...ancestor, partCount };
            })
        );

        return ancestorsWithCounts.map(ancestor => new CategoryResponseDto(ancestor));
    }

    private async getPartCount(categoryId: string): Promise<number> {
        return this.dataSource
            .getRepository(Part)
            .createQueryBuilder('part')
            .where('part.categoryId = :categoryId', { categoryId })
            .getCount();
    }

    private async addPartCountsToTree(tree: any): Promise<any> {
        const partCount = await this.getPartCount(tree.id);
        const treeWithCounts = { ...tree, partCount };

        if (treeWithCounts.children && treeWithCounts.children.length > 0) {
            treeWithCounts.children = await Promise.all(
                treeWithCounts.children.map((child: any) => this.addPartCountsToTree(child))
            );
        }

        return treeWithCounts;
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }

    private async isCircularReference(categoryId: string, potentialParentId: string): Promise<boolean> {
        if (categoryId === potentialParentId) {
            return true;
        }

        const potentialParent = await this.categoryRepository.findOne({
            where: { id: potentialParentId },
            relations: ['parent']
        });

        if (!potentialParent) {
            return false;
        }

        // Check if the potential parent is already a descendant of this category
        const descendants = await this.treeRepository.findDescendants(
            await this.categoryRepository.findOne({ where: { id: categoryId } })
        );

        return descendants.some(descendant => descendant.id === potentialParentId);
    }
}