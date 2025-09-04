import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
	@ApiProperty({
		description: 'Current password',
		example: 'currentpassword123',
	})
	@IsString()
	currentPassword: string;

	@ApiProperty({
		description: 'New password',
		example: 'newpassword123',
		minLength: 6,
	})
	@IsString()
	@MinLength(6)
	newPassword: string;
}

export class ForgotPasswordDto {
	@ApiProperty({
		description: 'User email address',
		example: 'user@example.com',
	})
	@IsEmail()
	email: string;
}

export class LoginDto {
	@ApiProperty({
		description: 'User email address',
		example: 'dev@example.com',
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		description: 'User password',
		example: 'Password123!',
		minLength: 6,
	})
	@IsString()
	@MinLength(6)
	password: string;
}

export class RegisterDto {
	@ApiProperty({
		description: 'User email address',
		example: 'user@example.com',
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		description: 'User password',
		example: 'password123',
		minLength: 6,
	})
	@IsString()
	@MinLength(6)
	password: string;

	@ApiProperty({
		description: 'User full name',
		example: 'John Doe',
	})
	@IsString()
	fullName: string;

	@ApiProperty({
		description: 'User phone number',
		example: '+1234567890',
		required: false,
	})
	@IsOptional()
	@IsString()
	phoneNumber?: string;

	// Profile image is now required
	@ApiProperty({
		description: 'Profile image file (required)',
		type: 'string',
		format: 'binary',
	})
	@IsNotEmpty()
	profileImage: any;
}

export class ResetPasswordDto {
	@ApiProperty({
		description: 'Password reset token',
		example: 'uuid-token-here',
	})
	@IsString()
	token: string;

	@ApiProperty({
		description: 'New password',
		example: 'newpassword123',
		minLength: 6,
	})
	@IsString()
	@MinLength(6)
	newPassword: string;
}
