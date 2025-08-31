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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const entity_enum_1 = require("../../common/enum/entity.enum");
const user_service_1 = require("./user.service");
const user_1 = require("../../dto/request/user");
const user_entity_1 = require("../../entities/user.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async getStaff(filters) {
        try {
            return await this.userService.findAllStaff(filters);
        }
        catch (error) {
            throw error;
        }
    }
    async createStaff(createStaffDto) {
        try {
            return await this.userService.createStaff(createStaffDto);
        }
        catch (error) {
            throw error;
        }
    }
    async updateStaff(id, updateStaffDto) {
        try {
            return await this.userService.updateStaff(id, updateStaffDto);
        }
        catch (error) {
            throw error;
        }
    }
    async deactivateStaff(id) {
        try {
            return await this.userService.deactivateStaff(id);
        }
        catch (error) {
            throw error;
        }
    }
    async activateStaff(id) {
        try {
            return await this.userService.activateStaff(id);
        }
        catch (error) {
            throw error;
        }
    }
    async getStaffStatistics() {
        try {
            return await this.userService.getStaffStatistics();
        }
        catch (error) {
            throw error;
        }
    }
    async getProfile(req) {
        try {
            if (!req.user || !req.user.id) {
                throw new common_1.UnauthorizedException('User not authenticated');
            }
            return await this.userService.findById(req.user.id);
        }
        catch (error) {
            throw error;
        }
    }
    async updateProfile(req, updateProfileDto) {
        try {
            if (!req.user || !req.user.id) {
                throw new common_1.UnauthorizedException('User not authenticated');
            }
            return await this.userService.updateProfile(req.user.id, updateProfileDto);
        }
        catch (error) {
            throw error;
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('staff'),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.DEV, entity_enum_1.UserRoleEnum.MANAGER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all staff members',
        description: 'Admin only endpoint to retrieve all staff members with filtering and pagination',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Staff members retrieved successfully',
        type: [user_entity_1.User],
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Unauthorized - Invalid or missing token',
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Forbidden - User does not have admin role',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'role',
        required: false,
        enum: entity_enum_1.UserRoleEnum,
        description: 'Filter by role',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        description: 'Search by name or email',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isActive',
        required: false,
        type: Boolean,
        description: 'Filter by active status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_1.StaffFilterDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getStaff", null);
__decorate([
    (0, common_1.Post)('staff'),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.DEV, entity_enum_1.UserRoleEnum.MANAGER),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new staff member',
        description: 'Admin only endpoint to create a new staff member',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Staff member created successfully',
        type: user_entity_1.User,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Unauthorized - Invalid or missing token',
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Forbidden - User does not have admin role',
    }),
    (0, swagger_1.ApiBody)({ type: user_1.CreateStaffDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_1.CreateStaffDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createStaff", null);
__decorate([
    (0, common_1.Patch)('staff/:id'),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.DEV, entity_enum_1.UserRoleEnum.MANAGER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a staff member',
        description: 'Admin only endpoint to update a staff member',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Staff member updated successfully',
        type: user_entity_1.User,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Unauthorized - Invalid or missing token',
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Forbidden - User does not have admin role',
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Staff member not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff member ID' }),
    (0, swagger_1.ApiBody)({ type: user_1.UpdateStaffDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_1.UpdateStaffDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateStaff", null);
__decorate([
    (0, common_1.Patch)('staff/:id/deactivate'),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.DEV, entity_enum_1.UserRoleEnum.MANAGER),
    (0, swagger_1.ApiOperation)({
        summary: 'Deactivate a staff member',
        description: 'Admin only endpoint to deactivate a staff member',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Staff member deactivated successfully',
        type: user_entity_1.User,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Unauthorized - Invalid or missing token',
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Forbidden - User does not have admin role',
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Staff member not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff member ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deactivateStaff", null);
__decorate([
    (0, common_1.Patch)('staff/:id/activate'),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.DEV, entity_enum_1.UserRoleEnum.MANAGER),
    (0, swagger_1.ApiOperation)({
        summary: 'Activate a staff member',
        description: 'Admin only endpoint to activate a deactivated staff member',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Staff member activated successfully',
        type: user_entity_1.User,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Unauthorized - Invalid or missing token',
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Forbidden - User does not have admin role',
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Staff member not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff member ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "activateStaff", null);
__decorate([
    (0, common_1.Get)('staff/statistics'),
    (0, roles_decorator_1.Roles)(entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.DEV, entity_enum_1.UserRoleEnum.MANAGER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get staff statistics',
        description: 'Admin only endpoint to get staff statistics',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Statistics retrieved successfully',
        type: user_1.StaffStatisticsDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Unauthorized - Invalid or missing token',
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Forbidden - User does not have admin role',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getStaffStatistics", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user profile',
        description: 'Get the authenticated user profile',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Profile retrieved successfully',
        type: user_entity_1.User,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Unauthorized - Invalid or missing token',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update user profile',
        description: 'Update the authenticated user profile',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Profile updated successfully',
        type: user_entity_1.User,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Unauthorized - Invalid or missing token',
    }),
    (0, swagger_1.ApiBody)({ type: user_1.UpdateProfileDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfile", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map