import { UserRoleEnum } from '../../common/enum/entity.enum';

export const seedUsersData = [
	{
		email: 'admin@example.com',
		fullName: 'Admin User',
		phoneNumber: '+10000000001',
		role: UserRoleEnum.ADMIN,
		password: 'Password123!',
	},
	{
		email: 'manager@example.com',
		fullName: 'Manager User',
		phoneNumber: '+10000000002',
		role: UserRoleEnum.MANAGER,
		password: 'Password123!',
	},
	{
		email: 'dev@example.com',
		fullName: 'Developer User',
		phoneNumber: '+10000000003',
		role: UserRoleEnum.DEV,
		password: 'Password123!',
	},
];
