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
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const entity_enum_1 = require("../../common/enum/entity.enum");
const notification_service_1 = require("../notification/notification.service");
const notification_enum_1 = require("../../common/enum/notification.enum");
let UserService = UserService_1 = class UserService {
    constructor(userRepository, notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(UserService_1.name);
    }
    async getProfile(userId) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['profileImage'],
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return this.mapToProfileResponseDto(user);
        }
        catch (error) {
            this.logger.error('Failed to get user profile', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to get profile');
        }
    }
    async updateProfile(userId, dto) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (dto.fullName !== undefined)
                user.fullName = dto.fullName;
            if (dto.phoneNumber !== undefined)
                user.phoneNumber = dto.phoneNumber;
            if (dto.email !== undefined)
                user.email = dto.email;
            user.updatedBy = userId;
            const updatedUser = await this.userRepository.save(user);
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.PROFILE_UPDATED,
                title: 'Password Changed',
                message: 'Your profile has been updated successfully.',
                audience: notification_enum_1.NotificationAudienceEnum.SPECIFIC_USER,
                userIds: [userId],
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
            });
            return this.mapToProfileResponseDto(updatedUser);
        }
        catch (error) {
            this.logger.error('Failed to update user profile', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update profile');
        }
    }
    async assignRole(adminId, dto) {
        try {
            const admin = await this.userRepository.findOne({
                where: { id: adminId },
            });
            if (!admin) {
                throw new common_1.NotFoundException('Admin user not found');
            }
            const allowedRoles = [
                entity_enum_1.UserRoleEnum.ADMIN,
                entity_enum_1.UserRoleEnum.MANAGER,
                entity_enum_1.UserRoleEnum.DEV,
            ];
            if (!allowedRoles.includes(admin.role)) {
                throw new common_1.ForbiddenException('You do not have permission to assign roles');
            }
            const user = await this.userRepository.findOne({
                where: { id: dto.userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const previousRole = user.role;
            user.role = dto.role;
            user.updatedBy = adminId;
            const updatedUser = await this.userRepository.save(user);
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.ROLE_ASSIGNED,
                title: 'Role Assigned',
                message: `Your role has been updated from ${previousRole} to ${dto.role}`,
                audience: notification_enum_1.NotificationAudienceEnum.SPECIFIC_USER,
                channel: notification_enum_1.NotificationChannelEnum.EMAIL,
                emailTemplate: 'role-assigned',
                userIds: [user.id],
                metadata: {
                    previousRole,
                    newRole: dto.role,
                    assignedBy: admin.fullName,
                },
            });
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.SYSTEM_UPDATE,
                title: 'Role Assignment',
                message: `${admin.fullName} assigned role ${dto.role} to ${user.fullName}`,
                audience: notification_enum_1.NotificationAudienceEnum.ADMIN,
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
                metadata: {
                    userId: user.id,
                    userEmail: user.email,
                    previousRole,
                    newRole: dto.role,
                    assignedBy: admin.fullName,
                },
            });
            return this.mapToResponseDto(updatedUser);
        }
        catch (error) {
            this.logger.error('Failed to assign role', error);
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to assign role');
        }
    }
    async getAllUsers(filter) {
        try {
            const { page = 1, limit = 10, ...restFilter } = filter;
            const skip = (page - 1) * limit;
            const query = this.userRepository.createQueryBuilder('user');
            if (restFilter.role) {
                query.andWhere('user.role = :role', { role: restFilter.role });
            }
            if (restFilter.isActive !== undefined) {
                query.andWhere('user.isActive = :isActive', {
                    isActive: restFilter.isActive,
                });
            }
            if (restFilter.search) {
                query.andWhere('(user.email ILIKE :search OR user.fullName ILIKE :search)', { search: `%${restFilter.search}%` });
            }
            const total = await query.getCount();
            const sortBy = restFilter.sortBy || 'createdAt';
            const sortOrder = restFilter.sortOrder || 'DESC';
            query.orderBy(`user.${sortBy}`, sortOrder);
            query.skip(skip).take(limit);
            const users = await query.getMany();
            const totalPages = Math.ceil(total / limit);
            const hasNext = page < totalPages;
            const hasPrev = page > 1;
            return {
                items: users.map((user) => this.mapToResponseDto(user)),
                total,
                page,
                limit,
                totalPages,
                hasNext,
                hasPrev,
            };
        }
        catch (error) {
            this.logger.error('Failed to get all users', error);
            throw new common_1.BadRequestException('Failed to retrieve users');
        }
    }
    async getUserById(id) {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return this.mapToResponseDto(user);
        }
        catch (error) {
            this.logger.error(`Failed to get user by ID: ${id}`, error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to retrieve user');
        }
    }
    async updateUser(adminId, userId, dto) {
        try {
            const admin = await this.userRepository.findOne({
                where: { id: adminId },
            });
            if (!admin ||
                (admin.role !== entity_enum_1.UserRoleEnum.ADMIN &&
                    admin.role !== entity_enum_1.UserRoleEnum.MANAGER)) {
                throw new common_1.ForbiddenException('Insufficient permissions');
            }
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (dto.fullName !== undefined)
                user.fullName = dto.fullName;
            if (dto.email !== undefined)
                user.email = dto.email;
            if (dto.phoneNumber !== undefined)
                user.phoneNumber = dto.phoneNumber;
            if (dto.role !== undefined)
                user.role = dto.role;
            if (dto.isActive !== undefined)
                user.isActive = dto.isActive;
            user.updatedBy = adminId;
            const updatedUser = await this.userRepository.save(user);
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.USER_UPDATED,
                title: 'User Updated',
                message: 'user has been updated successfully.',
                audience: notification_enum_1.NotificationAudienceEnum.SPECIFIC_USER,
                userIds: [userId],
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
            });
            return this.mapToResponseDto(updatedUser);
        }
        catch (error) {
            this.logger.error('Failed to update user', error);
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update user');
        }
    }
    async deleteUser(adminId, userId) {
        try {
            const admin = await this.userRepository.findOne({
                where: { id: adminId },
            });
            if (!admin || admin.role !== entity_enum_1.UserRoleEnum.ADMIN) {
                throw new common_1.ForbiddenException('Only admins can delete users');
            }
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            await this.userRepository.remove(user);
            await this.notificationService.sendNotification({
                type: notification_enum_1.NotificationEnum.USER_DELETED,
                title: 'User Deleted',
                message: 'user has been deleted successfully.',
                audience: notification_enum_1.NotificationAudienceEnum.SPECIFIC_USER,
                userIds: [adminId],
                channel: notification_enum_1.NotificationChannelEnum.WEBSOCKET,
            });
            return {
                message: 'user deleted successfully',
                success: true,
            };
        }
        catch (error) {
            this.logger.error('Failed to delete user', error);
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to delete user');
        }
    }
    async getUsersWithoutRole() {
        try {
            const users = await this.userRepository.find({
                where: { role: entity_enum_1.UserRoleEnum.UNKNOWN },
                order: { createdAt: 'DESC' },
            });
            return users.map((user) => this.mapToResponseDto(user));
        }
        catch (error) {
            this.logger.error('Failed to get users without role', error);
            throw new common_1.BadRequestException('Failed to retrieve users without role');
        }
    }
    mapToResponseDto(user) {
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            isActive: user.isActive,
            phoneNumber: user.phoneNumber,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    mapToProfileImageResponseDto(image) {
        const dto = {
            id: image.id,
            url: image.url,
            format: image.format,
            size: image.size,
            entityType: image.type,
            createdAt: image.createdAt,
            updatedAt: image.updatedAt,
        };
        return dto;
    }
    mapToProfileResponseDto(user) {
        let profileImageDto = null;
        if (user.profileImage) {
            profileImageDto = this.mapToProfileImageResponseDto(user.profileImage);
        }
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            phoneNumber: user.phoneNumber,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            profileImage: profileImageDto,
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notification_service_1.NotificationService])
], UserService);
//# sourceMappingURL=user.service.js.map