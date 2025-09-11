import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserRoleEnum } from '../../common/enum/entity.enum';
import { NotificationService } from '../notification/notification.service';
import { NotificationEnum, NotificationAudienceEnum, NotificationChannel, NotificationChannelEnum } from '../../common/enum/notification.enum';
import {
  UpdateProfileDto,
  AssignRoleDto,
  UpdateUserDto,
  UserFilterDto,
} from '../../dto/request/user.dto';
import {
  UserResponseDto,
  UserProfileResponseDto,
  UsersListResponseDto,
} from '../../dto/response/user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
  ) { }

  async getProfile(userId: string): Promise<UserProfileResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return this.mapToProfileResponseDto(user);
    } catch (error) {
      this.logger.error('Failed to get user profile', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to get profile');
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update user fields
      if (dto.fullName !== undefined) user.fullName = dto.fullName;
      if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber;

      const updatedUser = await this.userRepository.save(user);

      return this.mapToProfileResponseDto(updatedUser);
    } catch (error) {
      this.logger.error('Failed to update user profile', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update profile');
    }
  }

  async assignRole(adminId: string, dto: AssignRoleDto): Promise<UserResponseDto> {
    try {
      // Get admin user
      const admin = await this.userRepository.findOne({
        where: { id: adminId },
      });

      if (!admin) {
        throw new NotFoundException('Admin user not found');
      }

      // Check if admin has permission to assign roles
      const allowedRoles = [UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV];
      if (!allowedRoles.includes(admin.role)) {
        throw new ForbiddenException('You do not have permission to assign roles');
      }

      // Get target user
      const user = await this.userRepository.findOne({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update user role
      const previousRole = user.role;
      user.role = dto.role;
      const updatedUser = await this.userRepository.save(user);

      // Send notification to user
      await this.notificationService.sendNotification({
        type: NotificationEnum.ROLE_ASSIGNED,
        title: 'Role Assigned',
        message: `Your role has been updated from ${previousRole} to ${dto.role}`,
        audience: NotificationAudienceEnum.SPECIFIC_USER,
        channel: NotificationChannelEnum.EMAIL,
        emailTemplate: 'role-assigned',
        userIds: [user.id],
        metadata: {
          previousRole,
          newRole: dto.role,
          assignedBy: admin.fullName,
        },
      });

      // Send notification to admins
      await this.notificationService.sendNotification({
        type: NotificationEnum.SYSTEM_UPDATE,
        title: 'Role Assignment',
        message: `${admin.fullName} assigned role ${dto.role} to ${user.fullName}`,
        audience: NotificationAudienceEnum.ADMIN,
        metadata: {
          userId: user.id,
          userEmail: user.email,
          previousRole,
          newRole: dto.role,
          assignedBy: admin.id,
        },
      });

      return this.mapToResponseDto(updatedUser);
    } catch (error) {
      this.logger.error('Failed to assign role', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to assign role');
    }
  }

  async getAllUsers(filter: UserFilterDto): Promise<UsersListResponseDto> {
    try {
      const query = this.userRepository.createQueryBuilder('user');

      // Apply filters
      if (filter.role) {
        query.andWhere('user.role = :role', { role: filter.role });
      }

      if (filter.isActive !== undefined) {
        query.andWhere('user.isActive = :isActive', { isActive: filter.isActive });
      }

      if (filter.search) {
        query.andWhere(
          '(user.email ILIKE :search OR user.fullName ILIKE :search)',
          { search: `%${filter.search}%` },
        );
      }

      // Apply sorting
      const sortBy = filter.sortBy || 'createdAt';
      const sortOrder = filter.sortOrder || 'DESC';
      query.orderBy(`user.${sortBy}`, sortOrder);

      // Get total count
      const total = await query.getCount();

      // Apply pagination (default values if not provided)
      const page = 1;
      const limit = 10;
      query.skip((page - 1) * limit).take(limit);

      const users = await query.getMany();

      return {
        users: users.map(user => this.mapToResponseDto(user)),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Failed to get all users', error);
      throw new BadRequestException('Failed to retrieve users');
    }
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return this.mapToResponseDto(user);
    } catch (error) {
      this.logger.error(`Failed to get user by ID: ${id}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  async updateUser(adminId: string, userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      // Check admin permissions
      const admin = await this.userRepository.findOne({
        where: { id: adminId },
      });

      if (!admin || (admin.role !== UserRoleEnum.ADMIN && admin.role !== UserRoleEnum.MANAGER)) {
        throw new ForbiddenException('Insufficient permissions');
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update fields
      if (dto.fullName !== undefined) user.fullName = dto.fullName;
      if (dto.email !== undefined) user.email = dto.email;
      if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber;
      if (dto.role !== undefined) user.role = dto.role;
      if (dto.isActive !== undefined) user.isActive = dto.isActive;

      const updatedUser = await this.userRepository.save(user);

      return this.mapToResponseDto(updatedUser);
    } catch (error) {
      this.logger.error('Failed to update user', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  async deleteUser(adminId: string, userId: string): Promise<void> {
    try {
      // Check admin permissions
      const admin = await this.userRepository.findOne({
        where: { id: adminId },
      });

      if (!admin || admin.role !== UserRoleEnum.ADMIN) {
        throw new ForbiddenException('Only admins can delete users');
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.userRepository.remove(user);
    } catch (error) {
      this.logger.error('Failed to delete user', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user');
    }
  }

  async getUsersWithoutRole(): Promise<UserResponseDto[]> {
    try {
      const users = await this.userRepository.find({
        where: { role: UserRoleEnum.UNKNOWN },
        order: { createdAt: 'DESC' },
      });

      return users.map(user => this.mapToResponseDto(user));
    } catch (error) {
      this.logger.error('Failed to get users without role', error);
      throw new BadRequestException('Failed to retrieve users without role');
    }
  }

  private mapToResponseDto(user: User): UserResponseDto {
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

  private mapToProfileResponseDto(user: User): UserProfileResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
