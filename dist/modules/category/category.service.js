"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("../../entities/category.entity");
const category_dto_1 = require("../../dto/response/category.dto");
const category_dto_2 = require("../../dto/request/category.dto");
const part_entity_1 = require("../../entities/part.entity");
let CategoryService = class CategoryService {
    constructor(categoryRepository, dataSource) {
        this.categoryRepository = categoryRepository;
        this.dataSource = dataSource;
        this.treeRepository = dataSource.getTreeRepository(category_entity_1.Category);
    }
    async create(createCategoryDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { parentId, ...categoryData } = createCategoryDto;
            const slug = this.generateSlug(categoryData.name);
            const existingSlug = await this.categoryRepository.findOne({
                where: { slug }
            });
            if (existingSlug) {
                throw new common_1.BadRequestException('Category slug already exists');
            }
            const category = this.categoryRepository.create({
                ...categoryData,
                slug
            });
            if (parentId) {
                const parent = await this.categoryRepository.findOne({
                    where: { id: parentId }
                });
                if (!parent) {
                    throw new common_1.NotFoundException('Parent category not found');
                }
                const existingName = await this.categoryRepository.findOne({
                    where: {
                        name: categoryData.name,
                        parentId: parentId
                    }
                });
                if (existingName) {
                    throw new common_1.BadRequestException('Category name already exists under this parent');
                }
                category.parent = parent;
            }
            else {
                const existingName = await this.categoryRepository.findOne({
                    where: {
                        name: categoryData.name,
                        parentId: null
                    }
                });
                if (existingName) {
                    throw new common_1.BadRequestException('Category name already exists at root level');
                }
            }
            const savedCategory = await queryRunner.manager.save(category);
            await queryRunner.commitTransaction();
            const partCount = await this.getPartCount(savedCategory.id);
            return new category_dto_1.CategoryResponseDto({ ...savedCategory, partCount });
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(query) {
        const { page, limit, sortBy, sortOrder, ...filters } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.name) {
            where.name = (0, typeorm_2.Like)(`%${filters.name}%`);
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
        const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
            const partCount = await this.getPartCount(category.id);
            return { ...category, partCount };
        }));
        return {
            data: categoriesWithCounts.map(category => new category_dto_1.CategoryResponseDto(category)),
            total
        };
    }
    async findOne(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['parent', 'children', 'image']
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        const partCount = await this.getPartCount(id);
        return new category_dto_1.CategoryResponseDto({ ...category, partCount });
    }
    async update(id, updateCategoryDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const category = await this.categoryRepository.findOne({
                where: { id },
                relations: ['parent']
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
            if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
                const existingName = await this.categoryRepository.findOne({
                    where: {
                        name: updateCategoryDto.name,
                        parentId: category.parentId
                    }
                });
                if (existingName && existingName.id !== id) {
                    throw new common_1.BadRequestException('Category name already exists at this level');
                }
                category.slug = this.generateSlug(updateCategoryDto.name);
            }
            if (updateCategoryDto.parentId !== undefined) {
                if (updateCategoryDto.parentId === null) {
                    category.parent = null;
                    category.parentId = null;
                }
                else if (updateCategoryDto.parentId !== category.parentId) {
                    const newParent = await this.categoryRepository.findOne({
                        where: { id: updateCategoryDto.parentId }
                    });
                    if (!newParent) {
                        throw new common_1.NotFoundException('New parent category not found');
                    }
                    if (await this.isCircularReference(id, updateCategoryDto.parentId)) {
                        throw new common_1.BadRequestException('Circular reference detected');
                    }
                    const existingName = await this.categoryRepository.findOne({
                        where: {
                            name: category.name,
                            parentId: updateCategoryDto.parentId
                        }
                    });
                    if (existingName && existingName.id !== id) {
                        throw new common_1.BadRequestException('Category name already exists under the new parent');
                    }
                    category.parent = newParent;
                }
            }
            Object.assign(category, updateCategoryDto);
            const updatedCategory = await queryRunner.manager.save(category);
            await queryRunner.commitTransaction();
            const partCount = await this.getPartCount(id);
            return new category_dto_1.CategoryResponseDto({ ...updatedCategory, partCount });
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async remove(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['children', 'parts']
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (category.children && category.children.length > 0) {
            throw new common_1.BadRequestException('Cannot delete category with children');
        }
        const partCount = await this.getPartCount(id);
        if (partCount > 0) {
            throw new common_1.BadRequestException('Cannot delete category with associated parts');
        }
        await this.categoryRepository.remove(category);
    }
    async getTree() {
        const trees = await this.treeRepository.findTrees({
            relations: ['image']
        });
        const treesWithCounts = await Promise.all(trees.map(async (tree) => {
            const treeWithCounts = await this.addPartCountsToTree(tree);
            return new category_dto_2.CategoryTreeDto(treeWithCounts);
        }));
        return treesWithCounts;
    }
    async getDescendants(id) {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        const descendants = await this.treeRepository.findDescendantsTree(category, {
            relations: ['image']
        });
        const descendantsWithCounts = await this.addPartCountsToTree(descendants);
        return [new category_dto_2.CategoryTreeDto(descendantsWithCounts)];
    }
    async getAncestors(id) {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        const ancestors = await this.treeRepository.findAncestors(category, {
            relations: ['image']
        });
        const ancestorsWithCounts = await Promise.all(ancestors.map(async (ancestor) => {
            const partCount = await this.getPartCount(ancestor.id);
            return { ...ancestor, partCount };
        }));
        return ancestorsWithCounts.map(ancestor => new category_dto_1.CategoryResponseDto(ancestor));
    }
    async getPartCount(categoryId) {
        return this.dataSource
            .getRepository(part_entity_1.Part)
            .createQueryBuilder('part')
            .where('part.categoryId = :categoryId', { categoryId })
            .getCount();
    }
    async addPartCountsToTree(tree) {
        const partCount = await this.getPartCount(tree.id);
        const treeWithCounts = { ...tree, partCount };
        if (treeWithCounts.children && treeWithCounts.children.length > 0) {
            treeWithCounts.children = await Promise.all(treeWithCounts.children.map((child) => this.addPartCountsToTree(child)));
        }
        return treeWithCounts;
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
    async isCircularReference(categoryId, potentialParentId) {
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
        const descendants = await this.treeRepository.findDescendants(await this.categoryRepository.findOne({ where: { id: categoryId } }));
        return descendants.some(descendant => descendant.id === potentialParentId);
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], CategoryService);
//# sourceMappingURL=category.service.js.map