import {
	IsString,
	IsOptional,
	IsEnum,
	IsUUID,
	Matches,
	IsNotEmpty,
	IsEmail,
	IsInt,
	Max,
	Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRoleEnum } from '../../common/enum/entity.enum';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
	@ApiProperty({
		type: 'string',
		format: 'binary',
		description: 'User image file (optional)',
	})
	image?: any;

	@ApiPropertyOptional({ example: 'John Doe Updated' })
	@IsOptional()
	@IsString()
	fullName?: string;

	@ApiPropertyOptional({ example: '+1234567890' })
	@IsOptional()
	@IsString()
	@Matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
		message: 'Invalid phone number format',
	})
	phoneNumber?: string;

	@ApiPropertyOptional({ example: 'examplegmail.com' })
	@IsOptional()
	@IsEmail()
	email?: string;
}

export class AssignRoleDto {
	@ApiProperty({ example: 'user-uuid' })
	@IsUUID()
	@IsNotEmpty()
	userId: string;

	@ApiProperty({ enum: UserRoleEnum, example: UserRoleEnum.STAFF })
	@IsEnum(UserRoleEnum)
	@IsNotEmpty()
	role: UserRoleEnum;
}

export class UpdateUserDto {
	@ApiProperty({
		type: 'string',
		format: 'binary',
		description: 'Category image file (optional)',
	})
	image?: any;

	@ApiPropertyOptional({ example: 'John Doe' })
	@IsOptional()
	@IsString()
	fullName?: string;

	@ApiPropertyOptional({ example: 'john.updated@example.com' })
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({ example: '+1234567890' })
	@IsOptional()
	@IsString()
	phoneNumber?: string;

	@ApiPropertyOptional({ enum: UserRoleEnum })
	@IsOptional()
	@IsEnum(UserRoleEnum)
	role?: UserRoleEnum;

	@ApiPropertyOptional()
	@IsOptional()
	isActive?: boolean;
}

export class UserFilterDto {
	@ApiPropertyOptional({ enum: UserRoleEnum })
	@IsOptional()
	@IsEnum(UserRoleEnum)
	role?: UserRoleEnum;

	@ApiPropertyOptional()
	@IsOptional()
	isActive?: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	sortBy?: string;

	@ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
	@IsOptional()
	@IsEnum(['ASC', 'DESC'])
	sortOrder?: 'ASC' | 'DESC';

	@ApiPropertyOptional({
		description: 'Page number (starting from 1)',
		minimum: 1,
		default: 1,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@IsOptional()
	page?: number = 1;

	@ApiPropertyOptional({
		description: 'Number of items per page',
		minimum: 1,
		maximum: 100,
		default: 10,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(1000)
	@IsOptional()
	limit?: number = 10;
}
