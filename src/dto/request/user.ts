import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRoleEnum } from 'src/common/enum/entity.enum';

export class AssignRoleDto {
  @ApiProperty({ description: 'New role to assign', enum: UserRoleEnum, example: UserRoleEnum.MANAGER })
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}