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
	ApiBearerAuth,
	ApiQuery,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import {
	CategoryResponseDto,
	PaginatedCategoryResponse,
	PaginatedCategoryTreeResponse,
} from '../../dto/response/category.dto';
import {
	CategoryQueryDto,
	CategoryTreeQueryDto,
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
	@ApiResponse({ status: 200, type: CategoryResponseDto })
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
	@ApiResponse({ status: 200, type: PaginatedCategoryTreeResponse })
	async findTree(
		@Query() queryDto: CategoryTreeQueryDto
	): Promise<PaginatedCategoryTreeResponse> {
		return this.categoryService.findTree(
			queryDto.page,
			queryDto.limit,
			queryDto.search
		);
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
	@ApiResponse({ status: 200, type: PaginatedCategoryResponse })
	async findAll(
		@Query() queryDto: CategoryQueryDto
	): Promise<PaginatedCategoryResponse> {
		return this.categoryService.findAll(
			queryDto.page,
			queryDto.limit,
			queryDto.search
		);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a specific category' })
	@ApiResponse({ status: 200, type: CategoryResponseDto })
	async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
		return this.categoryService.findOne(id);
	}

	@Put(':id')
	@UseInterceptors(FileInterceptor('image'))
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Update a category' })
	@ApiResponse({ status: 200, type: CategoryResponseDto })
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
