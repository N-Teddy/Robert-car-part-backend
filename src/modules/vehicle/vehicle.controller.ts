// src/modules/vehicle/vehicle.controller.ts
import {
	Controller,
	Post,
	Body,
	UploadedFiles,
	UseInterceptors,
	Get,
	Param,
	Delete,
	Query,
	Req,
	UseGuards,
	Patch,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
	ApiTags,
	ApiOperation,
	ApiConsumes,
	ApiBody,
	ApiBearerAuth,
	ApiQuery,
} from '@nestjs/swagger';
import { VehicleResponseDto } from '../../dto/response/vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { VehicleService } from './vehicle.service';
import {
	CreateVehicleDto,
	UpdateVehicleDto,
	VehicleQueryDto,
} from 'src/dto/request/vehicle.dto';

@ApiTags('Vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicles')
export class VehicleController {
	constructor(private readonly vehicleService: VehicleService) { }

	@Post()
	@UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Create a new vehicle' })
	@ApiBody({
		description: 'Vehicle data with optional images',
		type: CreateVehicleDto,
	})
	async create(
		@Body() dto: CreateVehicleDto,
		@UploadedFiles() images: Express.Multer.File[],
		@Req() req: any
	): Promise<VehicleResponseDto> {
		return this.vehicleService.create(dto, images, req.user.id);
	}

	@Get()
	@ApiOperation({ summary: 'Get paginated list of vehicles with filters' })
	async findAll(
		@Query() query: VehicleQueryDto
	) {
		return this.vehicleService.findAll(query);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a specific vehicle' })
	async findOne(@Param('id') id: string): Promise<VehicleResponseDto> {
		return this.vehicleService.findOne(id);
	}

	@Patch(':id')
	@UseInterceptors(FilesInterceptor('images', 10))
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Update a vehicle' })
	async update(
		@Param('id') id: string,
		@Body() dto: UpdateVehicleDto,
		@UploadedFiles() images: Express.Multer.File[],
		@Req() req: any
	): Promise<VehicleResponseDto> {
		return this.vehicleService.update(id, dto, images, req.user.id);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a vehicle' })
	async remove(@Param('id') id: string, @Req() req: any) {
		return this.vehicleService.remove(id, req.user.id);
	}

	@Post(':id/part-out')
	@ApiOperation({ summary: 'Mark vehicle as parted out' })
	async markAsPartedOut(
		@Param('id') id: string,
		@Req() req: any
	): Promise<VehicleResponseDto> {
		return this.vehicleService.markAsPartedOut(id, req.user.id);
	}

	@Get('stats/summary')
	@ApiOperation({ summary: 'Get vehicle statistics summary' })
	async getStatistics() {
		return this.vehicleService.getStatistics();
	}

	@Get('stats/make-model')
	@ApiOperation({ summary: 'Get vehicle statistics by make and model' })
	async getMakeModelStatistics() {
		return this.vehicleService.getMakeModelStatistics();
	}
}