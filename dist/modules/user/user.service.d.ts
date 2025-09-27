import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { UpdateProfileDto, AssignRoleDto, UpdateUserDto, UserFilterDto } from '../../dto/request/user.dto';
import { UserResponseDto, UserProfileResponseDto, UsersListResponseDto } from '../../dto/response/user.dto';
import { UploadService } from '../upload/upload.service';
export declare class UserService {
    private readonly userRepository;
    private readonly notificationService;
    private readonly uploadService;
    private readonly logger;
    constructor(userRepository: Repository<User>, notificationService: NotificationService, uploadService: UploadService);
    getProfile(userId: string): Promise<UserProfileResponseDto>;
    updateProfile(userId: string, dto: UpdateProfileDto, imageFile?: Express.Multer.File): Promise<UserProfileResponseDto>;
    assignRole(adminId: string, dto: AssignRoleDto): Promise<UserResponseDto>;
    getAllUsers(filter: UserFilterDto): Promise<UsersListResponseDto>;
    getUserById(id: string): Promise<UserResponseDto>;
    updateUser(adminId: string, userId: string, dto: UpdateUserDto, imageFile?: Express.Multer.File): Promise<UserResponseDto>;
    deleteUser(adminId: string, userId: string): Promise<any>;
    getUsersWithoutRole(): Promise<UserResponseDto[]>;
    private mapToResponseDto;
    private mapToProfileImageResponseDto;
    private mapToProfileResponseDto;
}
