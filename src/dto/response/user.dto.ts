import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '../../common/enum/entity.enum';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ enum: RoleEnum })
  role: RoleEnum;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  phoneNumber?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UserProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ enum: RoleEnum })
  role: RoleEnum;

  @ApiProperty({ required: false })
  phoneNumber?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

}

export class UsersListResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  users: UserResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}