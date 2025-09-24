import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, ILike, Repository, TreeRepository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { Image } from '../../entities/image.entity';
import {
	CreateCategoryDto,
	UpdateCategoryDto,
} from '../../dto/request/category.dto';
import {
	CategoryResponseDto,
	PaginatedCategoryTreeResponse,
} from '../../dto/response/category.dto';
import { UploadService } from '../upload/upload.service';
import { NotificationService } from '../notification/notification.service';
import { ImageEnum } from '../../common/enum/entity.enum';
import {
	NotificationAudienceEnum,
	NotificationChannelEnum,
	NotificationEnum,
} from '../../common/enum/notification.enum';

@Injectable()
export class CategoryService {
	constructor(
		@InjectRepository(Category)
		private readonly categoryRepo: TreeRepository<Category>,
		@InjectRepository(Image)
		private readonly imageRepo: Repository<Image>,
		private readonly uploadService: UploadService,
		private readonly notificationService: NotificationService
	) {}

	// Create a new category with optional parent and image
	async create(
		dto: CreateCategoryDto,
		imageFile?: Express.Multer.File,
		userId?: string
	): Promise<CategoryResponseDto> {
		try {
			// Check if category name already exists
			const exists = await this.categoryRepo.findOne({
				where: { name: dto.name },
			});
			if (exists) {
				throw new ConflictException(
					'A category with this name already exists'
				);
			}

			let parent: Category = null;

			// Validate parent if provided
			if (dto.parentId) {
				parent = await this.categoryRepo.findOne({
					where: { id: dto.parentId },
					relations: ['image'],
				});
				if (!parent) {
					throw new NotFoundException('Parent category not found');
				}
			}

			const category = this.categoryRepo.create({
				name: dto.name,
				description: dto.description,
				parent: parent,
				createdBy: userId,
			});

			const savedCategory = await this.categoryRepo.save(category);

			// Upload image if provided
			if (imageFile) {
				await this.uploadService.uploadSingleImage(
					imageFile,
					ImageEnum.CATEGORY,
					savedCategory.id,
					userId
				);
			}

			// Notify admins
			await this.notificationService.sendNotification({
				type: NotificationEnum.CATEGORY_CREATED,
				title: 'Category Created',
				message: `Category "${savedCategory.name}" has been created.`,
				audience: NotificationAudienceEnum.ADMIN,
				channel: NotificationChannelEnum.WEBSOCKET,
			});

			// Reload with relations for response
			const categoryWithRelations = await this.categoryRepo.findOne({
				where: { id: savedCategory.id },
				relations: ['image', 'parent'],
			});

			return CategoryResponseDto.fromEntity(categoryWithRelations);
		} catch (error) {
			if (
				error instanceof ConflictException ||
				error instanceof NotFoundException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException(
				error?.message || 'Failed to create category'
			);
		}
	}

	// Get all categories as a tree structure with images
	async findTree(
		page: number = 1,
		limit: number = 10,
		search?: string
	): Promise<PaginatedCategoryTreeResponse> {
		try {
			// First get all root categories (categories without parents) with pagination and search
			const query = this.categoryRepo
				.createQueryBuilder('category')
				.leftJoinAndSelect('category.image', 'image')
				.where('category.parentId IS NULL');

			// Apply search filter if provided
			if (search) {
				query.andWhere(
					'(category.name ILIKE :search OR category.description ILIKE :search)',
					{
						search: `%${search}%`,
					}
				);
			}

			// Get total count of root categories
			const total = await query.getCount();

			// Calculate pagination metadata
			const totalPages = Math.ceil(total / limit);
			const hasNext = page < totalPages;
			const hasPrev = page > 1;

			// Apply pagination to root categories
			const skip = (page - 1) * limit;
			const rootCategories = await query
				.orderBy('category.name', 'ASC')
				.skip(skip)
				.take(limit)
				.getMany();

			// For each root category, get its full descendant tree
			const categoriesWithTrees = await Promise.all(
				rootCategories.map(async (rootCategory) => {
					const fullTree =
						await this.categoryRepo.findDescendantsTree(
							rootCategory
						);
					return fullTree;
				})
			);

			// Load images for all categories in all trees
			const allCategoryIds = categoriesWithTrees.reduce((ids, tree) => {
				const getIdsFromTree = (category: Category): string[] => {
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

			let data: CategoryResponseDto[];

			if (allCategoryIds.length > 0) {
				const categoriesWithImages = await this.categoryRepo
					.createQueryBuilder('category')
					.leftJoinAndSelect('category.image', 'image')
					.where('category.id IN (:...ids)', { ids: allCategoryIds })
					.getMany();

				// Create image map
				const imageMap = new Map<string, Image>();
				categoriesWithImages.forEach((cat) => {
					if (cat.image) {
						imageMap.set(cat.id, cat.image);
					}
				});

				// Add images to trees
				const addImagesToTree = (category: Category): Category => {
					return {
						...category,
						image: imageMap.get(category.id) || null,
						children:
							category.children && category.children.length > 0
								? category.children.map((child) =>
										addImagesToTree(child)
									)
								: [],
					};
				};

				const treesWithImages = categoriesWithTrees.map((tree) =>
					addImagesToTree(tree)
				);
				data = treesWithImages.map((tree) =>
					this.mapToTreeResponseDto(tree)
				);
			} else {
				data = categoriesWithTrees.map((tree) =>
					this.mapToTreeResponseDto(tree)
				);
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
		} catch (error) {
			throw new InternalServerErrorException(
				error?.message || 'Failed to fetch category tree'
			);
		}
	}

	// Get children of a specific category
	async findChildren(parentId: string): Promise<CategoryResponseDto[]> {
		try {
			const parent = await this.categoryRepo.findOne({
				where: { id: parentId },
				relations: ['image'], // make sure parent image is loaded
			});

			if (!parent) {
				throw new NotFoundException('Parent category not found');
			}

			// Load full descendants tree
			const childrenTree =
				await this.categoryRepo.findDescendantsTree(parent);

			// Fetch all categories with images
			const categoriesWithImages = await this.categoryRepo.find({
				relations: ['image'],
			});

			// Build image map
			const imageMap = new Map<string, Image>();
			categoriesWithImages.forEach((cat) => {
				if (cat.image) {
					imageMap.set(cat.id, cat.image);
				}
			});

			// Recursive helper to attach images from map
			const addImagesToTree = (category: Category): Category => {
				return {
					...category,
					image: imageMap.get(category.id) || null,
					children:
						category.children && category.children.length > 0
							? category.children.map((child) =>
									addImagesToTree(child)
								)
							: [],
				};
			};

			// Attach images to children
			const childrenWithImages = childrenTree.children.map((child) =>
				addImagesToTree(child)
			);

			// Map to response DTOs
			return childrenWithImages.map((child) =>
				this.mapToTreeResponseDto(child)
			);
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException(
				error?.message || 'Failed to fetch category children'
			);
		}
	}

	// Paginated flat list with search
	async findAll(
		page = 1,
		limit = 10,
		search?: string
	): Promise<{
		data: CategoryResponseDto[];
		total: number;
		page: number;
		limit: number;
	}> {
		try {
			const skip = (page - 1) * limit;
			const options: FindManyOptions<Category> = {
				relations: ['image', 'parent'],
				order: { createdAt: 'DESC' },
				skip,
				take: limit,
			};

			if (search) {
				options.where = [
					{ name: ILike(`%${search}%`) },
					{ description: ILike(`%${search}%`) },
				];
			}

			const [rows, total] = await this.categoryRepo.findAndCount(options);
			return {
				data: rows.map(CategoryResponseDto.fromEntity),
				total,
				page,
				limit,
			};
		} catch (error) {
			throw new InternalServerErrorException(
				error?.message || 'Failed to fetch categories'
			);
		}
	}

	async findOne(id: string): Promise<CategoryResponseDto> {
		try {
			const found = await this.categoryRepo.findOne({
				where: { id },
				relations: ['image', 'parent', 'children'],
			});

			if (!found) {
				throw new NotFoundException('Category not found');
			}

			return CategoryResponseDto.fromEntity(found);
		} catch (error) {
			if (error instanceof NotFoundException) throw error;
			throw new InternalServerErrorException(
				error?.message || 'Failed to fetch category'
			);
		}
	}

	async update(
		id: string,
		dto: UpdateCategoryDto,
		imageFile?: Express.Multer.File,
		userId?: string
	): Promise<CategoryResponseDto> {
		try {
			const category = await this.categoryRepo.findOne({
				where: { id },
				relations: ['image', 'parent'],
			});

			if (!category) {
				throw new NotFoundException('Category not found');
			}

			// Check name uniqueness if changing
			if (dto.name && dto.name !== category.name) {
				const nameExists = await this.categoryRepo.findOne({
					where: { name: dto.name },
				});
				if (nameExists && nameExists.id !== category.id) {
					throw new ConflictException(
						'A category with this name already exists'
					);
				}
			}

			// Handle parent change - convert empty string to null
			let parent: Category = null;
			if (dto.parentId !== undefined) {
				// Handle empty string by converting to null
				const parentId = dto.parentId === '' ? null : dto.parentId;

				if (parentId === null) {
					// Setting to root (no parent)
					parent = null;
				} else if (parentId === category.id) {
					throw new BadRequestException(
						'Category cannot be its own parent'
					);
				} else {
					parent = await this.categoryRepo.findOne({
						where: { id: parentId },
						relations: ['image'],
					});
					if (!parent) {
						throw new NotFoundException(
							'Parent category not found'
						);
					}

					// Check for circular references in the hierarchy
					const isCircular = await this.checkCircularReference(
						category,
						parent
					);
					if (isCircular) {
						throw new BadRequestException(
							'Circular reference detected in category hierarchy'
						);
					}
				}
				category.parent = parent;
			}

			// Update other fields
			category.name = dto.name ?? category.name;
			category.description = dto.description ?? category.description;
			category.updatedBy = userId;

			const savedCategory = await this.categoryRepo.save(category);

			// Handle image upload
			if (imageFile) {
				await this.uploadService.uploadSingleImage(
					imageFile,
					ImageEnum.CATEGORY,
					savedCategory.id,
					userId
				);
			}

			// Notify admins
			await this.notificationService.sendNotification({
				type: NotificationEnum.CATEGORY_UPDATED,
				title: 'Category Updated',
				message: `Category "${savedCategory.name}" has been updated.`,
				audience: NotificationAudienceEnum.ADMIN,
				channel: NotificationChannelEnum.WEBSOCKET,
			});

			// Reload with relations
			const updatedCategory = await this.categoryRepo.findOne({
				where: { id: savedCategory.id },
				relations: ['image', 'parent'],
			});

			return CategoryResponseDto.fromEntity(updatedCategory);
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof ConflictException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException(
				error?.message || 'Failed to update category'
			);
		}
	}

	async remove(id: string): Promise<{ success: true }> {
		try {
			const category = await this.categoryRepo.findOne({
				where: { id },
				relations: ['image', 'children'],
			});

			if (!category) {
				throw new NotFoundException('Category not found');
			}

			// Check if category has children
			if (category.children && category.children.length > 0) {
				throw new BadRequestException(
					'Cannot delete category with child categories. Please delete children first or reassign them.'
				);
			}

			// Delete associated image if exists
			if (category.image) {
				await this.uploadService.deleteImage(category.image.id);
			}

			await this.categoryRepo.remove(category);

			// Notify admins
			await this.notificationService.sendNotification({
				type: NotificationEnum.CATEGORY_DELETED,
				title: 'Category Deleted',
				message: `Category "${category.name}" has been deleted.`,
				audience: NotificationAudienceEnum.ADMIN,
				channel: NotificationChannelEnum.WEBSOCKET,
			});

			return { success: true };
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException(
				error?.message || 'Failed to delete category'
			);
		}
	}

	// Helper method to check for circular references
	private async checkCircularReference(
		category: Category,
		potentialParent: Category
	): Promise<boolean> {
		let current: Category = potentialParent;

		while (current.parent) {
			if (current.parent.id === category.id) {
				return true; // Circular reference found
			}
			current = current.parent;
		}

		return false;
	}

	// Helper method to convert entity to tree response DTO (for internal use)
	private mapToTreeResponseDto(category: Category): CategoryResponseDto {
		const dto = CategoryResponseDto.fromEntity(category);

		// Add children recursively if they exist
		if (category.children && category.children.length > 0) {
			dto.children = category.children.map((child) =>
				this.mapToTreeResponseDto(child)
			);
		} else {
			dto.children = [];
		}

		return dto;
	}
}
