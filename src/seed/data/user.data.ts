import { UserRoleEnum } from 'src/common/enum/entity.enum';

export interface SampleUser {
	email: string;
	password: string; // This will be hashed later
	fullName: string;
	phoneNumber: string;
	role: UserRoleEnum;
	isFirstLogin?: boolean;
	isActive?: boolean;
}

export const SAMPLE_USERS: SampleUser[] = [
	{
		email: 'teddy.webdev@gmail.com',
		password: 'Teddy2005',
		fullName: 'Ngangman Teddy',
		phoneNumber: '+237693087159',
		role: UserRoleEnum.DEV,
		isActive: true,
	},
];
