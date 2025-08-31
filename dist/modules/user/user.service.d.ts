import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { NotificationService } from '../notification/notification.service';
import { CreateStaffDto, StaffFilterDto, StaffStatisticsDto, UpdateProfileDto, UpdateStaffDto } from 'src/dto/request/user';
export declare class UserService {
    private readonly userRepository;
    private readonly dataSource;
    private readonly notificationService;
    constructor(userRepository: Repository<User>, dataSource: DataSource, notificationService: NotificationService);
    findAllStaff(filters: StaffFilterDto): Promise<{
        users: User[];
        total: number;
    }>;
    createStaff(createStaffDto: CreateStaffDto): Promise<User>;
    updateStaff(userId: string, updateStaffDto: UpdateStaffDto): Promise<User>;
    deactivateStaff(userId: string): Promise<User>;
    activateStaff(userId: string): Promise<User>;
    private generateTempPassword;
    getStaffStatistics(): Promise<StaffStatisticsDto>;
    findById(id: string): Promise<User>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User>;
    userExists(email: string): Promise<boolean>;
    getActiveStaff(): Promise<User[]>;
}
