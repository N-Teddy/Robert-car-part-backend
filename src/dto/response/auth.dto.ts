import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '../../common/enum/entity.enum';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  tokenType: string;

  @ApiProperty()
  user: UserAuthInfo;
}

export class UserAuthInfo {
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
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  success?: boolean;
}

export class TokenValidationResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiProperty({ required: false })
  userId?: string;

  @ApiProperty({ required: false })
  email?: string;
}