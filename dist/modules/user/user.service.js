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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const entity_enum_1 = require("../../common/enum/entity.enum");
const user_entity_1 = require("../../entities/user.entity");
const typeorm_1 = require("typeorm");
const notification_service_1 = require("../notification/notification.service");
const typeorm_2 = require("@nestjs/typeorm");
const bcrypt = require("bcrypt");
let UserService = class UserService {
    constructor(userRepository, dataSource, notificationService) {
        this.userRepository = userRepository;
        this.dataSource = dataSource;
        this.notificationService = notificationService;
    }
    async findAllStaff(filters) {
        try {
            const { role, search, page = 1, limit = 10, isActive } = filters;
            const query = this.userRepository.createQueryBuilder('user')
                .where('user.role IN (:...roles)', {
                roles: [entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.DEV]
            })
                .leftJoinAndSelect('user.profileImage', 'profileImage');
            if (role)
                query.andWhere('user.role = :role', { role });
            if (isActive !== undefined)
                query.andWhere('user.isActive = :isActive', { isActive });
            if (search) {
                query.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search)', {
                    search: `%${search}%`
                });
            }
            const [users, total] = await query
                .orderBy('user.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { users, total };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch staff members');
        }
    }
    async createStaff(createStaffDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const existingUser = await queryRunner.manager.findOne(user_entity_1.User, {
                where: { email: createStaffDto.email }
            });
            if (existingUser) {
                throw new common_1.BadRequestException('User with this email already exists');
            }
            const tempPassword = this.generateTempPassword();
            const hashedPassword = await bcrypt.hash(tempPassword, 12);
            const user = queryRunner.manager.create(user_entity_1.User, {
                ...createStaffDto,
                password: hashedPassword,
                isFirstLogin: true,
                isActive: true
            });
            const savedUser = await queryRunner.manager.save(user);
            await queryRunner.commitTransaction();
            try {
                const html = this.notificationService.renderTemplate('staff-welcome', {
                    name: savedUser.fullName,
                    tempPassword,
                    loginUrl: `${process.env.FRONTEND_URL}/login`
                });
                await this.notificationService.sendEmail({
                    to: savedUser.email,
                    subject: 'Welcome to Car Parts Shop Staff Portal',
                    html,
                });
            }
            catch (emailError) {
                console.error('Failed to send welcome email:', emailError.message);
            }
            return savedUser;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create staff member');
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateStaff(userId, updateStaffDto) {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new common_1.NotFoundException('Staff member not found');
            }
            if (updateStaffDto.role && updateStaffDto.role !== entity_enum_1.UserRoleEnum.ADMIN && user.role === entity_enum_1.UserRoleEnum.ADMIN) {
                const adminCount = await this.userRepository.count({
                    where: { role: entity_enum_1.UserRoleEnum.ADMIN, isActive: true }
                });
                if (adminCount <= 1) {
                    throw new common_1.BadRequestException('Cannot demote the last active administrator');
                }
            }
            Object.assign(user, updateStaffDto);
            return await this.userRepository.save(user);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update staff member');
        }
    }
    async deactivateStaff(userId) {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new common_1.NotFoundException('Staff member not found');
            }
            if (user.role === entity_enum_1.UserRoleEnum.ADMIN) {
                const adminCount = await this.userRepository.count({
                    where: { role: entity_enum_1.UserRoleEnum.ADMIN, isActive: true }
                });
                if (adminCount <= 1) {
                    throw new common_1.BadRequestException('Cannot deactivate the last active administrator');
                }
            }
            user.isActive = false;
            return await this.userRepository.save(user);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to deactivate staff member');
        }
    }
    async activateStaff(userId) {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new common_1.NotFoundException('Staff member not found');
            }
            user.isActive = true;
            return await this.userRepository.save(user);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to activate staff member');
        }
    }
    generateTempPassword() {
        try {
            return Math.random().toString(36).slice(-8) + 'A1!';
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to generate temporary password');
        }
    }
    async getStaffStatistics() {
        try {
            const totalStaff = await this.userRepository.count({
                where: {
                    role: (0, typeorm_1.In)([entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.DEV])
                }
            });
            const activeStaff = await this.userRepository.count({
                where: {
                    role: (0, typeorm_1.In)([entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.DEV]),
                    isActive: true
                }
            });
            const roleCounts = await this.userRepository
                .createQueryBuilder('user')
                .select('user.role', 'role')
                .addSelect('COUNT(user.id)', 'count')
                .where('user.role IN (:...roles)', {
                roles: [entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.DEV]
            })
                .andWhere('user.isActive = :isActive', { isActive: true })
                .groupBy('user.role')
                .getRawMany();
            return {
                totalStaff,
                activeStaff,
                inactiveStaff: totalStaff - activeStaff,
                byRole: roleCounts.reduce((acc, item) => {
                    acc[item.role] = parseInt(item.count);
                    return acc;
                }, {})
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch staff statistics');
        }
    }
    async findById(id) {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
                relations: ['profileImage']
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to fetch user');
        }
    }
    async updateProfile(userId, updateProfileDto) {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            Object.assign(user, updateProfileDto);
            return await this.userRepository.save(user);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update profile');
        }
    }
    async userExists(email) {
        try {
            const count = await this.userRepository.count({ where: { email } });
            return count > 0;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to check user existence');
        }
    }
    async getActiveStaff() {
        try {
            return await this.userRepository.find({
                where: {
                    role: (0, typeorm_1.In)([entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.DEV]),
                    isActive: true
                },
                order: { fullName: 'ASC' }
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch active staff members');
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.DataSource,
        notification_service_1.NotificationService])
], UserService);
//# sourceMappingURL=user.service.js.map