// src/modules/category/category.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { UserRoleEnum } from '../../common/enum/entity.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CategoryResponseDto } from 'src/dto/response/category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoryQueryDto, CategoryTreeDto, CreateCategoryDto, UpdateCategoryDto } from 'src/dto/request/category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
    @ApiOperation({ summary: 'Create a new category' })
    @ApiResponse({ type: CategoryResponseDto })
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.create(createCategoryDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all categories with pagination and filtering' })
    @ApiResponse({ type: [CategoryResponseDto] })
    async findAll(@Query() query: CategoryQueryDto) {
        return this.categoryService.findAll(query);
    }

    @Get('tree')
    @ApiOperation({ summary: 'Get category tree structure' })
    @ApiResponse({ type: [CategoryTreeDto] })
    async getTree() {
        return this.categoryService.getTree();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a category by ID' })
    @ApiResponse({ type: CategoryResponseDto })
    async findOne(@Param('id') id: string) {
        return this.categoryService.findOne(id);
    }

    @Get(':id/descendants')
    @ApiOperation({ summary: 'Get descendants of a category' })
    @ApiResponse({ type: [CategoryTreeDto] })
    async getDescendants(@Param('id') id: string) {
        return this.categoryService.getDescendants(id);
    }

    @Get(':id/ancestors')
    @ApiOperation({ summary: 'Get ancestors of a category' })
    @ApiResponse({ type: [CategoryResponseDto] })
    async getAncestors(@Param('id') id: string) {
        return this.categoryService.getAncestors(id);
    }

    @Patch(':id')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
    @ApiOperation({ summary: 'Update a category' })
    @ApiResponse({ type: CategoryResponseDto })
    async update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto
    ) {
        return this.categoryService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
    @ApiOperation({ summary: 'Delete a category' })
    async remove(@Param('id') id: string) {
        return this.categoryService.remove(id);
    }
}