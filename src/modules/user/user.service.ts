import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { UserRoleEnum } from 'src/common/enum/entity.enum';
import { User } from 'src/entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { NotificationService } from '../notification/notification.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
	CreateStaffDto,
	StaffFilterDto,
	StaffStatisticsDto,
	UpdateProfileDto,
	UpdateStaffDto,
} from 'src/dto/request/user';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

	private readonly logger = new Logger(UserService.name);

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly dataSource: DataSource,
		private readonly notificationService: NotificationService

	) { }

	// Staff Management - Only for ADMIN, MANAGER, DEV roles
	async findAllStaff(
		filters: StaffFilterDto
	): Promise<{ users: User[]; total: number }> {
		try {
			const { role, search, page = 1, limit = 10, isActive } = filters;

			const query = this.userRepository
				.createQueryBuilder('user')
				.where('user.role IN (:...roles)', {
					roles: [
						UserRoleEnum.ADMIN,
						UserRoleEnum.MANAGER,
						UserRoleEnum.DEV,
					],
				})
				.leftJoinAndSelect('user.profileImage', 'profileImage');

			if (role) query.andWhere('user.role = :role', { role });
			if (isActive !== undefined)
				query.andWhere('user.isActive = :isActive', { isActive });
			if (search) {
				query.andWhere(
					'(user.fullName ILIKE :search OR user.email ILIKE :search)',
					{
						search: `%${search}%`,
					}
				);
			}

			const [users, total] = await query
				.orderBy('user.createdAt', 'DESC')
				.skip((page - 1) * limit)
				.take(limit)
				.getManyAndCount();

			return { users, total };
		} catch (error) {
			throw error
		}
	}

	async createStaff(createStaffDto: CreateStaffDto): Promise<User> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const existingUser = await queryRunner.manager.findOne(User, {
				where: { email: createStaffDto.email },
			});

			if (existingUser) {
				throw new BadRequestException(
					'User with this email already exists'
				);
			}

			const tempPassword = this.generateTempPassword();
			const hashedPassword = await bcrypt.hash(tempPassword, 12);

			const user = queryRunner.manager.create(User, {
				...createStaffDto,
				password: hashedPassword,
				isFirstLogin: true,
				isActive: true,
			});

			const savedUser = await queryRunner.manager.save(user);
			await queryRunner.commitTransaction();

			// Send welcome email with temp password
			try {
				const html = this.notificationService.renderTemplate(
					'staff-welcome',
					{
						name: savedUser.fullName,
						tempPassword,
						loginUrl: `${process.env.FRONTEND_URL}/login`,
					}
				);

				await this.notificationService.sendEmail({
					to: savedUser.email,
					subject: 'Welcome to Car Parts Shop Staff Portal',
					html,
				});
			} catch (emailError) {
				// Log email error but don't fail the operation
				this.logger.error('Failed to send welcome email:', emailError.message);
			}

			return savedUser;
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error
		} finally {
			await queryRunner.release();
		}
	}

	async updateStaff(
		userId: string,
		updateStaffDto: UpdateStaffDto
	): Promise<User> {
		try {
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});

			if (!user) {
				throw new NotFoundException('Staff member not found');
			}

			// Prevent demoting the last admin
			if (
				updateStaffDto.role &&
				updateStaffDto.role !== UserRoleEnum.ADMIN &&
				user.role === UserRoleEnum.ADMIN
			) {
				const adminCount = await this.userRepository.count({
					where: { role: UserRoleEnum.ADMIN, isActive: true },
				});

				if (adminCount <= 1) {
					throw new BadRequestException(
						'Cannot demote the last active administrator'
					);
				}
			}

			Object.assign(user, updateStaffDto);
			return await this.userRepository.save(user);
		} catch (error) {
			throw error;
		}
	}

	async deactivateStaff(userId: string): Promise<User> {
		try {
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});

			if (!user) {
				throw new NotFoundException('Staff member not found');
			}

			// Prevent deactivating the last admin
			if (user.role === UserRoleEnum.ADMIN) {
				const adminCount = await this.userRepository.count({
					where: { role: UserRoleEnum.ADMIN, isActive: true },
				});

				if (adminCount <= 1) {
					throw new BadRequestException(
						'Cannot deactivate the last active administrator'
					);
				}
			}

			user.isActive = false;
			return await this.userRepository.save(user);
		} catch (error) {
			throw error;
		}
	}

	async activateStaff(userId: string): Promise<User> {
		try {
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});

			if (!user) {
				throw new NotFoundException('Staff member not found');
			}

			user.isActive = true;
			return await this.userRepository.save(user);
		} catch (error) {
			throw error
		}
	}

	// Utility Methods
	private generateTempPassword(): string {
		try {
			return Math.random().toString(36).slice(-8) + 'A1!';
		} catch (error) {
			throw error
		}
	}

	async getStaffStatistics(): Promise<StaffStatisticsDto> {
		try {
			const totalStaff = await this.userRepository.count({
				where: {
					role: In([
						UserRoleEnum.ADMIN,
						UserRoleEnum.MANAGER,
						UserRoleEnum.DEV,
					]),
				},
			});

			const activeStaff = await this.userRepository.count({
				where: {
					role: In([
						UserRoleEnum.ADMIN,
						UserRoleEnum.MANAGER,
						UserRoleEnum.DEV,
					]),
					isActive: true,
				},
			});

			const roleCounts = await this.userRepository
				.createQueryBuilder('user')
				.select('user.role', 'role')
				.addSelect('COUNT(user.id)', 'count')
				.where('user.role IN (:...roles)', {
					roles: [
						UserRoleEnum.ADMIN,
						UserRoleEnum.MANAGER,
						UserRoleEnum.DEV,
					],
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
				}, {}),
			};
		} catch (error) {
			throw error
		}
	}

	// Get user by ID (for profile management)
	async findById(id: string): Promise<User> {
		try {
			const user = await this.userRepository.findOne({
				where: { id },
				relations: ['profileImage'],
			});

			if (!user) {
				throw new NotFoundException('User not found');
			}

			return user;
		} catch (error) {
			throw error
		}
	}

	// Update user profile
	async updateProfile(
		userId: string,
		updateProfileDto: UpdateProfileDto
	): Promise<User> {
		try {
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});

			if (!user) {
				throw new NotFoundException('User not found');
			}

			Object.assign(user, updateProfileDto);
			return await this.userRepository.save(user);
		} catch (error) {
			throw error
		}
	}

	// Additional utility method to check if user exists
	async userExists(email: string): Promise<boolean> {
		try {
			const count = await this.userRepository.count({ where: { email } });
			return count > 0;
		} catch (error) {
			throw error
		}
	}

	// Get all active staff members
	async getActiveStaff(): Promise<User[]> {
		try {
			return await this.userRepository.find({
				where: {
					role: In([
						UserRoleEnum.ADMIN,
						UserRoleEnum.MANAGER,
						UserRoleEnum.DEV,
					]),
					isActive: true,
				},
				order: { fullName: 'ASC' },
			});
		} catch (error) {
			throw error
		}
	}
}
