import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from '../../common/enum/entity.enum';
import { UploadedImageResponseDto } from './upload.dto';

export class UserResponseDto {
	@ApiProperty()
	id: string;

	@ApiProperty()
	email: string;

	@ApiProperty()
	fullName: string;

	@ApiProperty({ enum: UserRoleEnum })
	role: UserRoleEnum;

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

	@ApiProperty({ enum: UserRoleEnum })
	role: UserRoleEnum;

	@ApiProperty({ required: false })
	phoneNumber?: string;

	@ApiProperty()
	isActive: boolean;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiProperty({ required: false })
	profileImage?: UploadedImageResponseDto;
}

export class UsersListResponseDto {
	@ApiProperty({
		type: [UserResponseDto],
		description: 'Array of users',
	})
	items: UserResponseDto[];

	@ApiProperty({
		description: 'Total number of users across all pages',
		example: 150,
	})
	total: number;

	@ApiProperty({
		description: 'Current page number',
		example: 1,
		minimum: 1,
	})
	page: number;

	@ApiProperty({
		description: 'Number of items per page',
		example: 10,
		minimum: 1,
		maximum: 1000,
	})
	limit: number;

	@ApiProperty({
		description: 'Total number of pages',
		example: 15,
	})
	totalPages: number;

	@ApiProperty({
		description: 'Whether there is a next page',
		example: true,
	})
	hasNext: boolean;

	@ApiProperty({
		description: 'Whether there is a previous page',
		example: false,
	})
	hasPrev: boolean;
}
