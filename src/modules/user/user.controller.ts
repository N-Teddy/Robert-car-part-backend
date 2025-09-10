import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserService } from './user.service';
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
import { RoleEnum } from '../../common/enum/entity.enum';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  async getProfile(@Request() req): Promise<UserProfileResponseDto> {
    try {
      return await this.userService.getProfile(req.user.id);
    } catch (error) {
      throw error;
    }
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  async updateProfile(
    @Request() req,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    try {
      return await this.userService.updateProfile(req.user.id, dto);
    } catch (error) {
      throw error;
    }
  }

  @Post('assign-role')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.DEV)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async assignRole(
    @Request() req,
    @Body() dto: AssignRoleDto,
  ): Promise<UserResponseDto> {
    try {
      return await this.userService.assignRole(req.user.id, dto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  @ApiOperation({ summary: 'Get all users with filters' })
  @ApiResponse({ status: 200, type: UsersListResponseDto })
  async getAllUsers(@Query() filter: UserFilterDto): Promise<UsersListResponseDto> {
    try {
      return await this.userService.getAllUsers(filter);
    } catch (error) {
      throw error;
    }
  }

  @Get('without-role')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.DEV)
  @ApiOperation({ summary: 'Get users without assigned role' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async getUsersWithoutRole(): Promise<UserResponseDto[]> {
    try {
      return await this.userService.getUsersWithoutRole();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    try {
      return await this.userService.getUserById(id);
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateUser(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      return await this.userService.updateUser(req.user.id, id, dto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 204 })
  async deleteUser(
    @Request() req,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      return await this.userService.deleteUser(req.user.id, id);
    } catch (error) {
      throw error;
    }
  }
}