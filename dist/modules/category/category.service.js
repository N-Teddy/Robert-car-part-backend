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
const image_entity_1 = require("../../entities/image.entity");
const category_dto_1 = require("../../dto/response/category.dto");
const upload_service_1 = require("../upload/upload.service");
const notification_service_1 = require("../notification/notification.service");
const entity_enum_1 = require("../../common/enum/entity.enum");
const notification_enum_1 = require("../../common/enum/notification.enum");
let CategoryService = class CategoryService {
    constructor(categoryRepo, imageRepo, uploadService, notificationService) {
        this.categoryRepo = categoryRepo;
        this.imageRepo = imageRepo;
        this.uploadService = uploadService;
        this.notificationService = notificationService;
    }
    async create(dto, imageFile, userId) {
        try {
            const exists = await this.categoryRepo.findOne({
                where: { name: dto.name },
            });
            if (exists) {
                throw new common_1.ConflictException('A category with this name already exists');
            }
            let parent = null;
            if (dto.parentId) {
                parent = await this.categoryRepo.findOne({
                    where: { id: dto.parentId },
                    relations: ['image'],
                });
                if (!parent) {
                    throw new common_1.NotFoundException('Parent category not found');
                }
            }
            const category = this.categoryRepo.create({
                name: dto.name,
                description: dto.description,
                parent: parent,
                createdBy: userId,
            });
            const savedCategory = await this.categoryRepo.save(category);
            if (imageFile) {
                await this.uploadService.uploadSingleImage(imageFile, entity_enum_1.ImageEnum.CATEGORY, savedCategory.id, userId);
            }
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.CATEGORY_CREATED,
                title: 'Category Created',
                message: `Category "${savedCategory.name}" has been created.`,
                audience: notification_enum_1.NotificationAudienceEnum.ADMIN,
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
            });
            const categoryWithRelations = await this.categoryRepo.findOne({
                where: { id: savedCategory.id },
                relations: ['image', 'parent'],
            });
            return category_dto_1.CategoryResponseDto.fromEntity(categoryWithRelations);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(error?.message || 'Failed to create category');
        }
    }
    async findTree(page = 1, limit = 10, search) {
        try {
            const query = this.categoryRepo
                .createQueryBuilder('category')
                .leftJoinAndSelect('category.image', 'image')
                .where('category.parentId IS NULL');
            if (search) {
                query.andWhere('(category.name ILIKE :search OR category.description ILIKE :search)', {
                    search: `%${search}%`,
                });
            }
            const total = await query.getCount();
            const totalPages = Math.ceil(total / limit);
            const hasNext = page < totalPages;
            const hasPrev = page > 1;
            const skip = (page - 1) * limit;
            const rootCategories = await query
                .orderBy('category.name', 'ASC')
                .skip(skip)
                .take(limit)
                .getMany();
            const categoriesWithTrees = await Promise.all(rootCategories.map(async (rootCategory) => {
                const fullTree = await this.categoryRepo.findDescendantsTree(rootCategory);
                return fullTree;
            }));
            const allCategoryIds = categoriesWithTrees.reduce((ids, tree) => {
                const getIdsFromTree = (category) => {
                    const categoryIds = [category.id];
                    if (category.children && category.children.length > 0) {
                        category.children.forEach((child) => {
                            categoryIds.push(...getIdsFromTree(child));
                        });
                    }
                    return categoryIds;
                };
                return [...ids, ...getIdsFromTree(tree)];
            }, []);
            let data;
            if (allCategoryIds.length > 0) {
                const categoriesWithImages = await this.categoryRepo
                    .createQueryBuilder('category')
                    .leftJoinAndSelect('category.image', 'image')
                    .where('category.id IN (:...ids)', { ids: allCategoryIds })
                    .getMany();
                const imageMap = new Map();
                categoriesWithImages.forEach((cat) => {
                    if (cat.image) {
                        imageMap.set(cat.id, cat.image);
                    }
                });
                const addImagesToTree = (category) => {
                    return {
                        ...category,
                        image: imageMap.get(category.id) || null,
                        children: category.children && category.children.length > 0
                            ? category.children.map((child) => addImagesToTree(child))
                            : [],
                    };
                };
                const treesWithImages = categoriesWithTrees.map((tree) => addImagesToTree(tree));
                data = treesWithImages.map((tree) => this.mapToTreeResponseDto(tree));
            }
            else {
                data = categoriesWithTrees.map((tree) => this.mapToTreeResponseDto(tree));
            }
            return {
                data,
                total,
                page,
                limit,
                totalPages,
                hasNext,
                hasPrev,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error?.message || 'Failed to fetch category tree');
        }
    }
    async findChildren(parentId) {
        try {
            const parent = await this.categoryRepo.findOne({
                where: { id: parentId },
                relations: ['image'],
            });
            if (!parent) {
                throw new common_1.NotFoundException('Parent category not found');
            }
            const childrenTree = await this.categoryRepo.findDescendantsTree(parent);
            return childrenTree.children.map((child) => this.mapToTreeResponseDto(child));
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(error?.message || 'Failed to fetch category children');
        }
    }
    async findAll(page = 1, limit = 10, search) {
        try {
            const skip = (page - 1) * limit;
            const options = {
                relations: ['image', 'parent'],
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
            };
            if (search) {
                options.where = [
                    { name: (0, typeorm_2.ILike)(`%${search}%`) },
                    { description: (0, typeorm_2.ILike)(`%${search}%`) },
                ];
            }
            const [rows, total] = await this.categoryRepo.findAndCount(options);
            return {
                data: rows.map(category_dto_1.CategoryResponseDto.fromEntity),
                total,
                page,
                limit,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error?.message || 'Failed to fetch categories');
        }
    }
    async findOne(id) {
        try {
            const found = await this.categoryRepo.findOne({
                where: { id },
                relations: ['image', 'parent', 'children'],
            });
            if (!found) {
                throw new common_1.NotFoundException('Category not found');
            }
            return category_dto_1.CategoryResponseDto.fromEntity(found);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException(error?.message || 'Failed to fetch category');
        }
    }
    async update(id, dto, imageFile, userId) {
        try {
            const category = await this.categoryRepo.findOne({
                where: { id },
                relations: ['image', 'parent'],
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
            if (dto.name && dto.name !== category.name) {
                const nameExists = await this.categoryRepo.findOne({
                    where: { name: dto.name },
                });
                if (nameExists && nameExists.id !== category.id) {
                    throw new common_1.ConflictException('A category with this name already exists');
                }
            }
            let parent = null;
            if (dto.parentId !== undefined) {
                const parentId = dto.parentId === '' ? null : dto.parentId;
                if (parentId === null) {
                    parent = null;
                }
                else if (parentId === category.id) {
                    throw new common_1.BadRequestException('Category cannot be its own parent');
                }
                else {
                    parent = await this.categoryRepo.findOne({
                        where: { id: parentId },
                        relations: ['image'],
                    });
                    if (!parent) {
                        throw new common_1.NotFoundException('Parent category not found');
                    }
                    const isCircular = await this.checkCircularReference(category, parent);
                    if (isCircular) {
                        throw new common_1.BadRequestException('Circular reference detected in category hierarchy');
                    }
                }
                category.parent = parent;
            }
            category.name = dto.name ?? category.name;
            category.description = dto.description ?? category.description;
            category.updatedBy = userId;
            const savedCategory = await this.categoryRepo.save(category);
            if (imageFile) {
                await this.uploadService.uploadSingleImage(imageFile, entity_enum_1.ImageEnum.CATEGORY, savedCategory.id, userId);
            }
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.CATEGORY_UPDATED,
                title: 'Category Updated',
                message: `Category "${savedCategory.name}" has been updated.`,
                audience: notification_enum_1.NotificationAudienceEnum.ADMIN,
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
            });
            const updatedCategory = await this.categoryRepo.findOne({
                where: { id: savedCategory.id },
                relations: ['image', 'parent'],
            });
            return category_dto_1.CategoryResponseDto.fromEntity(updatedCategory);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(error?.message || 'Failed to update category');
        }
    }
    async remove(id) {
        try {
            const category = await this.categoryRepo.findOne({
                where: { id },
                relations: ['image', 'children'],
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
            if (category.children && category.children.length > 0) {
                throw new common_1.BadRequestException('Cannot delete category with child categories. Please delete children first or reassign them.');
            }
            if (category.image) {
                await this.uploadService.deleteImage(category.image.id);
            }
            await this.categoryRepo.remove(category);
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.CATEGORY_DELETED,
                title: 'Category Deleted',
                message: `Category "${category.name}" has been deleted.`,
                audience: notification_enum_1.NotificationAudienceEnum.ADMIN,
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
            });
            return { success: true };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(error?.message || 'Failed to delete category');
        }
    }
    async checkCircularReference(category, potentialParent) {
        let current = potentialParent;
        while (current.parent) {
            if (current.parent.id === category.id) {
                return true;
            }
            current = current.parent;
        }
        return false;
    }
    mapToTreeResponseDto(category) {
        const dto = category_dto_1.CategoryResponseDto.fromEntity(category);
        if (category.children && category.children.length > 0) {
            dto.children = category.children.map((child) => this.mapToTreeResponseDto(child));
        }
        else {
            dto.children = [];
        }
        return dto;
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(1, (0, typeorm_1.InjectRepository)(image_entity_1.Image)),
    __metadata("design:paramtypes", [typeorm_2.TreeRepository,
        typeorm_2.Repository,
        upload_service_1.UploadService,
        notification_service_1.NotificationService])
], CategoryService);
//# sourceMappingURL=category.service.js.map