import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
	Query,
	UseGuards,
	Request,
	UseInterceptors,
	UploadedFiles,
	ParseFilePipe,
	MaxFileSizeValidator,
	BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
	ApiTags,
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { VehicleService } from './vehicle.service';
import { ImageEnum } from '../../common/enum/entity.enum';
import { UserRoleEnum } from '../../common/enum/entity.enum';
import {
	CreateVehicleDto,
	UpdateVehicleDto,
	BulkCreateVehicleDto,
	BulkUpdateVehicleDto,
	VehicleSearchDto,
	VehiclePaginationDto,
	VehicleExportDto,
} from '../../dto/request/vehicle.dto';
import {
	VehicleResponseDto,
	VehiclesResponseDto,
	VehicleStatsResponseDto,
	BulkCreateResponseDto,
	BulkUpdateResponseDto,
	VehicleExportResponseDto,
} from '../../dto/response/vehicle.dto';

// Custom validator for image MIME types
const validateImageMimeType = (file: Express.Multer.File) => {
	const allowedMimeTypes = [
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/gif',
		'image/webp',
	];
	if (!allowedMimeTypes.includes(file.mimetype)) {
		throw new BadRequestException(
			`File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`
		);
	}
	return true;
};

@ApiTags('Vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VehicleController {

	constructor(
		private readonly vehicleService: VehicleService,
	) {}

	@Post()
	@ApiOperation({ summary: 'Create a new vehicle', description: 'Create a new vehicle with the provided details. VIN must be unique.' })
	@ApiResponse({ status: 201, description: 'Vehicle created successfully', type: VehicleResponseDto })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 409, description: 'VIN already exists' })
	@Roles( UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV, UserRoleEnum.SALES )
	async createVehicle(
		@Body() createVehicleDto: CreateVehicleDto,
		@Request() req: any
	): Promise<VehicleResponseDto> {
		const vehicle = await this.vehicleService.createVehicle(
			createVehicleDto,
			req.user.id
		);

		// Get vehicle with stats for response
		const vehicleWithStats = await this.vehicleService.findOne(vehicle.id);

		return {
			message: 'Vehicle created successfully',
			data: vehicleWithStats,
		};
	}

	@Post('bulk')
	@ApiOperation({ summary: 'Create multiple vehicles', description: 'Create multiple vehicles in a single request. Duplicate VINs will be skipped.' })
	@ApiResponse({ status: 201, description: 'Bulk vehicle creation completed', type: BulkCreateResponseDto })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
	async createVehiclesBulk(
		@Body() bulkCreateDto: BulkCreateVehicleDto,
		@Request() req: any
	): Promise<BulkCreateResponseDto> {
		const results = await this.vehicleService.createVehiclesBulk(
			bulkCreateDto,
			req.user.id
		);

		const successful = results.filter((r) => !r.error).length;
		const failed = results.filter((r) => r.error).length;

		return {
			message: 'Bulk vehicle creation completed',
			data: results,
			summary: {
				total: results.length,
				successful,
				failed,
			},
		};
	}

	@Put('bulk')
	@ApiOperation({ summary: 'Update multiple vehicles', description: 'Update multiple vehicles in a single request.' })
	@ApiResponse({ status: 200, description: 'Bulk vehicle update completed', type: BulkUpdateResponseDto })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
	async updateVehiclesBulk(
		@Body() bulkUpdateDto: BulkUpdateVehicleDto,
		@Request() req: any
	): Promise<BulkUpdateResponseDto> {
		const results = await this.vehicleService.updateVehiclesBulk(
			bulkUpdateDto,
			req.user.id
		);

		const successful = results.filter((r) => !r.error).length;
		const failed = results.filter((r) => r.error).length;

		return {
			message: 'Bulk vehicle update completed',
			data: results,
			summary: {
				total: results.length,
				successful,
				failed,
			},
		};
	}

	@Get()
	@ApiOperation({ summary: 'Get all vehicles', description: 'Retrieve vehicles with optional search, filtering, and pagination.' })
	@ApiResponse({ status: 200, description: 'Vehicles retrieved successfully', type: VehiclesResponseDto })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiQuery({ name: 'make', required: false, description: 'Filter by vehicle make' })
	@ApiQuery({ name: 'model', required: false, description: 'Filter by vehicle model' })
	@ApiQuery({ name: 'year', required: false, description: 'Filter by vehicle year' })
	@ApiQuery({ name: 'vin', required: false, description: 'Filter by VIN (partial match)' })
	@ApiQuery({ name: 'isPartedOut', required: false, description: 'Filter by parted out status' })
	@ApiQuery({ name: 'minPrice', required: false, description: 'Minimum purchase price' })
	@ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum purchase price' })
	@ApiQuery({ name: 'purchaseDateFrom', required: false, description: 'Purchase date from (YYYY-MM-DD)' })
	@ApiQuery({ name: 'purchaseDateTo', required: false, description: 'Purchase date to (YYYY-MM-DD)' })
	@ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
	@ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10, max: 100)' })
	@ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (default: createdAt)' })
	@ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order: ASC or DESC (default: DESC)' })
	async findAll(
		@Query() searchDto: VehicleSearchDto,
		@Query() paginationDto: VehiclePaginationDto
	): Promise<VehiclesResponseDto> {
		const { vehicles, meta } = await this.vehicleService.findAll(
			searchDto,
			paginationDto
		);

		return {
			message: 'Vehicles retrieved successfully',
			data: vehicles,
			meta,
		};
	}

	@Get('stats')
	@ApiOperation({ summary: 'Get vehicle statistics', description: 'Retrieve comprehensive statistics about all vehicles including financial metrics.' })
	@ApiResponse({ status: 200, description: 'Vehicle statistics retrieved successfully', type: VehicleStatsResponseDto })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
	async getVehicleStats(): Promise<VehicleStatsResponseDto> {
		const stats = await this.vehicleService.getVehicleStats();

		return {
			message: 'Vehicle statistics retrieved successfully',
			data: stats,
		};
	}

	@Get('export')
	@ApiOperation({ summary: 'Export vehicles', description: 'Export vehicles to CSV or PDF format with optional filtering.' })
	@ApiResponse({ status: 200, description: 'Vehicle export completed successfully', type: VehicleExportResponseDto })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV)
	async exportVehicles(
		@Query() exportDto: VehicleExportDto
	): Promise<VehicleExportResponseDto> {
		const exportData = await this.vehicleService.exportVehicles(exportDto);

		return {
			message: 'Vehicle export completed successfully',
			data: exportData,
			format: exportDto.format || 'csv',
			count: 0, // This would need to be calculated based on the export
		};
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get vehicle by ID', description: 'Retrieve a specific vehicle by its ID with all related data.' })
	@ApiResponse({ status: 200, description: 'Vehicle retrieved successfully', type: VehicleResponseDto })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 404, description: 'Vehicle not found' })
	async findOne(@Param('id') id: string): Promise<VehicleResponseDto> {
		const vehicle = await this.vehicleService.findOne(id);

		return {
			message: 'Vehicle retrieved successfully',
			data: vehicle,
		};
	}

	@Get('vin/:vin')
	@ApiOperation({ summary: 'Get vehicle by VIN', description: 'Retrieve a specific vehicle by its VIN with all related data.' })
	@ApiResponse({ status: 200, description: 'Vehicle retrieved successfully', type: VehicleResponseDto })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 404, description: 'Vehicle not found' })
	async findByVin(@Param('vin') vin: string): Promise<VehicleResponseDto> {
		const vehicle = await this.vehicleService.findByVin(vin);

		return {
			message: 'Vehicle retrieved successfully',
			data: vehicle,
		};
	}

	@Put(':id')
	@ApiOperation({ summary: 'Update vehicle', description: 'Update an existing vehicle. VIN uniqueness will be validated if changed.' })
	@ApiResponse({ status: 200, description: 'Vehicle updated successfully', type: VehicleResponseDto })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 404, description: 'Vehicle not found' })
	@ApiResponse({ status: 409, description: 'VIN already exists' })
	@Roles( UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV, UserRoleEnum.SALES )
	async updateVehicle(
		@Param('id') id: string,
		@Body() updateVehicleDto: UpdateVehicleDto,
		@Request() req: any
	): Promise<VehicleResponseDto> {
		const vehicle = await this.vehicleService.updateVehicle(
			id,
			updateVehicleDto,
			req.user.id
		);

		// Get vehicle with stats for response
		const vehicleWithStats = await this.vehicleService.findOne(id);

		return {
			message: 'Vehicle updated successfully',
			data: vehicleWithStats,
		};
	}

	@Put(':id/parted-out')
	@ApiOperation({ summary: 'Mark vehicle as parted out', description: 'Mark a vehicle as parted out when parts start being sold.' })
	@ApiResponse({ status: 200, description: 'Vehicle marked as parted out successfully', type: VehicleResponseDto })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 404, description: 'Vehicle not found' })
	@Roles( UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV, UserRoleEnum.SALES )
	async markAsPartedOut(
		@Param('id') id: string,
		@Request() req: any
	): Promise<VehicleResponseDto> {
		const vehicle = await this.vehicleService.markAsPartedOut(
			id,
			req.user.id
		);

		// Get vehicle with stats for response
		const vehicleWithStats = await this.vehicleService.findOne(id);

		return {
			message: 'Vehicle marked as parted out successfully',
			data: vehicleWithStats,
		};
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete vehicle', description: 'Permanently delete a vehicle. Cannot delete if it has existing parts.' })
	@ApiResponse({ status: 200, description: 'Vehicle deleted successfully' })
	@ApiResponse({ status: 400, description: 'Bad request - Vehicle has parts' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 404, description: 'Vehicle not found' })
	@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER)
	async deleteVehicle(@Param('id') id: string, @Request() req: any) {
		await this.vehicleService.deleteVehicle(id, req.user.id);

		return {
			message: 'Vehicle deleted successfully',
		};
	}
}
