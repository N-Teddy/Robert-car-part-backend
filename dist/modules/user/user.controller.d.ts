import { UserService } from './user.service';
import { CreateStaffDto, UpdateStaffDto, StaffFilterDto, UpdateProfileDto, StaffStatisticsDto } from '../../dto/request/user';
import { User } from '../../entities/user.entity';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getStaff(filters: StaffFilterDto): Promise<{
        users: User[];
        total: number;
    }>;
    createStaff(createStaffDto: CreateStaffDto): Promise<User>;
    updateStaff(id: string, updateStaffDto: UpdateStaffDto): Promise<User>;
    deactivateStaff(id: string): Promise<User>;
    activateStaff(id: string): Promise<User>;
    getStaffStatistics(): Promise<StaffStatisticsDto>;
    getProfile(req: any): Promise<User>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<User>;
}
