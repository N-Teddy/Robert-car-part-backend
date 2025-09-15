import {
	Injectable,
	Logger,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserRoleEnum } from '../../common/enum/entity.enum';
import { NotificationService } from '../notification/notification.service';
import {
	NotificationEnum,
	NotificationAudienceEnum,
	NotificationChannelEnum,
} from '../../common/enum/notification.enum';
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
import { UploadedImageResponseDto } from 'src/dto/response/upload.dto';
import { Image } from 'src/entities/image.entity';

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly notificationService: NotificationService
	) {}

	async getProfile(userId: string): Promise<UserProfileResponseDto> {
		try {
			const user = await this.userRepository.findOne({
				where: { id: userId },
				relations: ['profileImage'],
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

	async updateProfile(
		userId: string,
		dto: UpdateProfileDto
	): Promise<UserProfileResponseDto> {
		try {
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});

			if (!user) {
				throw new NotFoundException('User not found');
			}

			// Update user fields
			if (dto.fullName !== undefined) user.fullName = dto.fullName;
			if (dto.phoneNumber !== undefined)
				user.phoneNumber = dto.phoneNumber;
			if (dto.email !== undefined) user.email = dto.email;
			user.updatedBy = userId;

			const updatedUser = await this.userRepository.save(user);

			// Send notification
			await this.notificationService.sendNotification({
				type: NotificationEnum.PROFILE_UPDATED,
				title: 'Password Changed',
				message: 'Your profile has been updated successfully.',
				audience: NotificationAudienceEnum.SPECIFIC_USER,
				userIds: [userId],
				channel: NotificationChannelEnum.WEBSOCKET,
			});

			return this.mapToProfileResponseDto(updatedUser);
		} catch (error) {
			this.logger.error('Failed to update user profile', error);
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException('Failed to update profile');
		}
	}

	async assignRole(
		adminId: string,
		dto: AssignRoleDto
	): Promise<UserResponseDto> {
		try {
			// Get admin user
			const admin = await this.userRepository.findOne({
				where: { id: adminId },
			});

			if (!admin) {
				throw new NotFoundException('Admin user not found');
			}

			// Check if admin has permission to assign roles
			const allowedRoles = [
				UserRoleEnum.ADMIN,
				UserRoleEnum.MANAGER,
				UserRoleEnum.DEV,
			];
			if (!allowedRoles.includes(admin.role)) {
				throw new ForbiddenException(
					'You do not have permission to assign roles'
				);
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
			user.updatedBy = adminId;
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
				channel: NotificationChannelEnum.WEBSOCKET,
				metadata: {
					userId: user.id,
					userEmail: user.email,
					previousRole,
					newRole: dto.role,
					assignedBy: admin.fullName,
				},
			});

			return this.mapToResponseDto(updatedUser);
		} catch (error) {
			this.logger.error('Failed to assign role', error);
			if (
				error instanceof NotFoundException ||
				error instanceof ForbiddenException
			) {
				throw error;
			}
			throw new BadRequestException('Failed to assign role');
		}
	}

	async getAllUsers(filter: UserFilterDto): Promise<UsersListResponseDto> {
		try {
			const { page = 1, limit = 10, ...restFilter } = filter;
			const skip = (page - 1) * limit;

			const query = this.userRepository.createQueryBuilder('user');

			// Apply filters
			if (restFilter.role) {
				query.andWhere('user.role = :role', { role: restFilter.role });
			}

			if (restFilter.isActive !== undefined) {
				query.andWhere('user.isActive = :isActive', {
					isActive: restFilter.isActive,
				});
			}

			if (restFilter.search) {
				query.andWhere(
					'(user.email ILIKE :search OR user.fullName ILIKE :search)',
					{ search: `%${restFilter.search}%` }
				);
			}

			// Get total count before pagination
			const total = await query.getCount();

			// Apply sorting
			const sortBy = restFilter.sortBy || 'createdAt';
			const sortOrder = restFilter.sortOrder || 'DESC';
			query.orderBy(`user.${sortBy}`, sortOrder);

			// Apply pagination
			query.skip(skip).take(limit);

			const users = await query.getMany();

			// Calculate pagination metadata
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

	async updateUser(
		adminId: string,
		userId: string,
		dto: UpdateUserDto
	): Promise<UserResponseDto> {
		try {
			// Check admin permissions
			const admin = await this.userRepository.findOne({
				where: { id: adminId },
			});

			if (
				!admin ||
				(admin.role !== UserRoleEnum.ADMIN &&
					admin.role !== UserRoleEnum.MANAGER)
			) {
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
			if (dto.phoneNumber !== undefined)
				user.phoneNumber = dto.phoneNumber;
			if (dto.role !== undefined) user.role = dto.role;
			if (dto.isActive !== undefined) user.isActive = dto.isActive;
			user.updatedBy = adminId;

			const updatedUser = await this.userRepository.save(user);

			await this.notificationService.sendNotification({
				type: NotificationEnum.USER_UPDATED,
				title: 'User Updated',
				message: 'user has been updated successfully.',
				audience: NotificationAudienceEnum.SPECIFIC_USER,
				userIds: [userId],
				channel: NotificationChannelEnum.WEBSOCKET,
			});

			return this.mapToResponseDto(updatedUser);
		} catch (error) {
			this.logger.error('Failed to update user', error);
			if (
				error instanceof NotFoundException ||
				error instanceof ForbiddenException
			) {
				throw error;
			}
			throw new BadRequestException('Failed to update user');
		}
	}

	async deleteUser(adminId: string, userId: string): Promise<any> {
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

			await this.notificationService.sendNotification({
				type: NotificationEnum.USER_DELETED,
				title: 'User Deleted',
				message: 'user has been deleted successfully.',
				audience: NotificationAudienceEnum.SPECIFIC_USER,
				userIds: [adminId],
				channel: NotificationChannelEnum.WEBSOCKET,
			});

			return {
				message: 'user deleted successfully',
				success: true,
			};
		} catch (error) {
			this.logger.error('Failed to delete user', error);
			if (
				error instanceof NotFoundException ||
				error instanceof ForbiddenException
			) {
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

			return users.map((user) => this.mapToResponseDto(user));
		} catch (error) {
			this.logger.error('Failed to get users without role', error);
			throw new BadRequestException(
				'Failed to retrieve users without role'
			);
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

	private mapToProfileImageResponseDto(image: Partial<Image>) {
		const dto: Partial<UploadedImageResponseDto> = {
			id: image.id,
			url: image.url,
			format: image.format,
			size: image.size,
			entityType: image.type,
			// entityId: this.getEntityIdFromImage(image),
			createdAt: image.createdAt,
			updatedAt: image.updatedAt,
		};
		return dto;
	}

	private mapToProfileResponseDto(user: User): UserProfileResponseDto {
		// Get the image information if profileImage exists
		let profileImageDto = null;
		if (user.profileImage) {
			profileImageDto = this.mapToProfileImageResponseDto(
				user.profileImage
			);
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
			profileImage: profileImageDto, // Include the image data
		};
	}
}
