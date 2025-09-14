// src/modules/part/part.controller.ts
import {
	Controller,
	Post,
	Body,
	UploadedFiles,
	UseInterceptors,
	Get,
	Param,
	Put,
	Delete,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiConsumes,
	ApiBody,
	ApiBearerAuth,
	ApiQuery,
} from '@nestjs/swagger';
import { PartService } from './part.service';
import { PartResponseDto } from '../../dto/response/part.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePartDto, UpdatePartDto } from 'src/dto/request/part.dto';

@ApiTags('Parts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('parts')
export class PartController {
	constructor(private readonly partService: PartService) {}

	@Post()
	@UseInterceptors(FilesInterceptor('images', 10))
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Create a new part with QR code' })
	@ApiBody({
		description: 'Part data with optional images',
		type: CreatePartDto,
	})
	async create(
		@Body() dto: CreatePartDto,
		@UploadedFiles() images: Express.Multer.File[],
		@Req() req: any
	): Promise<PartResponseDto> {
		return this.partService.create(dto, images, req.user.id);
	}

	@Get()
	@ApiOperation({ summary: 'Get paginated list of parts with filters' })
	@ApiQuery({ name: 'page', required: false, type: Number })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	@ApiQuery({ name: 'search', required: false, type: String })
	@ApiQuery({ name: 'vehicleId', required: false, type: String })
	@ApiQuery({ name: 'categoryId', required: false, type: String })
	@ApiQuery({ name: 'minPrice', required: false, type: Number })
	@ApiQuery({ name: 'maxPrice', required: false, type: Number })
	@ApiQuery({ name: 'minQuantity', required: false, type: Number })
	@ApiQuery({ name: 'maxQuantity', required: false, type: Number })
	@ApiQuery({ name: 'condition', required: false, type: String })
	async findAll(
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('search') search?: string,
		@Query('vehicleId') vehicleId?: string,
		@Query('categoryId') categoryId?: string,
		@Query('minPrice') minPrice?: number,
		@Query('maxPrice') maxPrice?: number,
		@Query('minQuantity') minQuantity?: number,
		@Query('maxQuantity') maxQuantity?: number,
		@Query('condition') condition?: string
	) {
		return this.partService.findAll(
			page,
			limit,
			search,
			vehicleId,
			categoryId,
			minPrice,
			maxPrice,
			minQuantity,
			maxQuantity,
			condition
		);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a specific part' })
	async findOne(@Param('id') id: string): Promise<PartResponseDto> {
		return this.partService.findOne(id);
	}

	@Put(':id')
	@UseInterceptors(FilesInterceptor('images', 10))
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Update a part' })
	async update(
		@Param('id') id: string,
		@Body() dto: UpdatePartDto,
		@UploadedFiles() images: Express.Multer.File[],
		@Req() req: any
	): Promise<PartResponseDto> {
		return this.partService.update(id, dto, images, req.user.id);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a part' })
	async remove(@Param('id') id: string, @Req() req: any) {
		return this.partService.remove(id, req.user.id);
	}

	@Get('stats/summary')
	@ApiOperation({ summary: 'Get part statistics summary' })
	async getStatistics() {
		return this.partService.getStatistics();
	}

	@Get('stats/category')
	@ApiOperation({ summary: 'Get part statistics by category' })
	async getCategoryStatistics() {
		return this.partService.getCategoryStatistics();
	}

	@Get('inventory/low-stock')
	@ApiOperation({ summary: 'Get low stock parts' })
	async getLowStockParts(): Promise<PartResponseDto[]> {
		return this.partService.getLowStockParts();
	}
}
