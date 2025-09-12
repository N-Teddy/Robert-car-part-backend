import {
	Controller,
	Post,
	Body,
	UploadedFile,
	UseInterceptors,
	Req,
	Get,
	Param,
	Put,
	Delete,
	Query,
	UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiConsumes,
	ApiBody,
	ApiBearerAuth,
	ApiQuery,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import {
	CategoryResponseDto,
	PaginatedCategoryTreeResponse,
} from '../../dto/response/category.dto';
import {
	CreateCategoryDto,
	UpdateCategoryDto,
} from 'src/dto/request/category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Post()
	@UseInterceptors(FileInterceptor('image'))
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Create a new category' })
	async create(
		@Body() dto: CreateCategoryDto,
		@UploadedFile() image?: Express.Multer.File,
		@Req() req?: any
	): Promise<CategoryResponseDto> {
		return this.categoryService.create(dto, image, req.user?.id);
	}

	@Get('tree')
	@ApiOperation({
		summary: 'Get all categories as a tree structure with pagination',
	})
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Page number (default: 1)',
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Number of items per page (default: 10)',
	})
	@ApiQuery({
		name: 'search',
		required: false,
		type: String,
		description: 'Search term for category name or description',
	})
	@ApiResponse({
		status: 200,
		description: 'Paginated category tree retrieved successfully',
		type: PaginatedCategoryTreeResponse,
	})
	async findTree(
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('search') search?: string
	): Promise<PaginatedCategoryTreeResponse> {
		return this.categoryService.findTree(page, limit, search);
	}

	@Get(':id/children')
	@ApiOperation({ summary: 'Get children of a specific category' })
	async findChildren(
		@Param('id') id: string
	): Promise<CategoryResponseDto[]> {
		return this.categoryService.findChildren(id);
	}

	@Get()
	@ApiOperation({ summary: 'Get paginated list of categories' })
	@ApiQuery({ name: 'page', required: false, type: Number })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	@ApiQuery({ name: 'search', required: false, type: String })
	async findAll(
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('search') search?: string
	): Promise<{
		data: CategoryResponseDto[];
		total: number;
		page: number;
		limit: number;
	}> {
		return this.categoryService.findAll(page, limit, search);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a specific category' })
	async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
		return this.categoryService.findOne(id);
	}

	@Put(':id')
	@UseInterceptors(FileInterceptor('image'))
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Update a category' })
	async update(
		@Param('id') id: string,
		@Body() dto: UpdateCategoryDto,
		@UploadedFile() image?: Express.Multer.File,
		@Req() req?: any
	): Promise<CategoryResponseDto> {
		return this.categoryService.update(id, dto, image, req.user?.id);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a category' })
	async remove(@Param('id') id: string): Promise<{ success: true }> {
		return this.categoryService.remove(id);
	}
}
