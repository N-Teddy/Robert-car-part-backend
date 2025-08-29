import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { UserRoleEnum } from 'src/common/enum/entity.enum';

export class AssignRoleDto {
  @ApiProperty({ description: 'New role to assign', enum: UserRoleEnum, example: UserRoleEnum.MANAGER })
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}

export class CreateStaffDto {
  @ApiProperty({ example: 'staff@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ enum: UserRoleEnum, example: UserRoleEnum.MANAGER })
  @IsEnum([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV])
  role: UserRoleEnum.ADMIN | UserRoleEnum.MANAGER | UserRoleEnum.DEV;
}

export class UpdateStaffDto {
  @ApiPropertyOptional({ example: 'John Smith' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ enum: UserRoleEnum, example: UserRoleEnum.DEV })
  @IsOptional()
  @IsEnum([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.DEV])
  role?: UserRoleEnum.ADMIN | UserRoleEnum.MANAGER | UserRoleEnum.DEV;
}

export class StaffFilterDto {
  @ApiPropertyOptional({ enum: UserRoleEnum })
  @IsOptional()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum.ADMIN | UserRoleEnum.MANAGER | UserRoleEnum.DEV;

  @ApiPropertyOptional({ example: 'john' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

// For Swagger response typing
export class StaffStatisticsDto {
  @ApiProperty({ example: 15 })
  totalStaff: number;

  @ApiProperty({ example: 12 })
  activeStaff: number;

  @ApiProperty({ example: 3 })
  inactiveStaff: number;

  @ApiProperty({ example: { ADMIN: 2, MANAGER: 5, DEV: 5 } })
  byRole: Record<string, number>;
}