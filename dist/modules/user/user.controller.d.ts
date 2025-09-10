import { UserService } from './user.service';
import { UpdateProfileDto, AssignRoleDto, UpdateUserDto, UserFilterDto } from '../../dto/request/user.dto';
import { UserResponseDto, UserProfileResponseDto, UsersListResponseDto } from '../../dto/response/user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: any): Promise<UserProfileResponseDto>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<UserProfileResponseDto>;
    assignRole(req: any, dto: AssignRoleDto): Promise<UserResponseDto>;
    getAllUsers(filter: UserFilterDto): Promise<UsersListResponseDto>;
    getUsersWithoutRole(): Promise<UserResponseDto[]>;
    getUserById(id: string): Promise<UserResponseDto>;
    updateUser(req: any, id: string, dto: UpdateUserDto): Promise<UserResponseDto>;
    deleteUser(req: any, id: string): Promise<void>;
}
