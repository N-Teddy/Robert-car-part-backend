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
		email: 'admin@company.com',
		password: 'admin123', // Will be hashed
		fullName: 'Alice Johnson',
		phoneNumber: '+1-555-0101',
		role: UserRoleEnum.ADMIN,
		isFirstLogin: false,
		isActive: true,
	},
	{
		email: 'manager@company.com',
		password: 'manager123',
		fullName: 'Bob Smith',
		phoneNumber: '+1-555-0102',
		role: UserRoleEnum.MANAGER,
		isFirstLogin: false,
		isActive: true,
	},
	{
		email: 'dev@company.com',
		password: 'developer123',
		fullName: 'Charlie Brown',
		phoneNumber: '+1-555-0103',
		role: UserRoleEnum.DEV,
		isFirstLogin: false,
		isActive: true,
	},
	{
		email: 'sales@company.com',
		password: 'sales123',
		fullName: 'Diana Prince',
		phoneNumber: '+1-555-0104',
		role: UserRoleEnum.SALES,
		isFirstLogin: false,
		isActive: true,
	},
	{
		email: 'staff@company.com',
		password: 'staff123',
		fullName: 'Edward Wilson',
		phoneNumber: '+1-555-0105',
		role: UserRoleEnum.STAFF,
		isFirstLogin: false,
		isActive: true,
	},
	{
		email: 'customer@company.com',
		password: 'customer123',
		fullName: 'Fiona Gallagher',
		phoneNumber: '+1-555-0106',
		role: UserRoleEnum.CUSTOMER,
		isFirstLogin: false,
		isActive: true,
	},
	{
		email: 'unknown@company.com',
		password: 'unknown123',
		fullName: 'George Unknown',
		phoneNumber: '+1-555-0107',
		role: UserRoleEnum.UNKNOWN,
		isFirstLogin: false,
		isActive: true,
	},
	// // Additional users for each role if needed


	// {
	// 	email: 'testuser1@example.com',
	// 	password: 'TestPass1!',
	// 	fullName: 'Test User 1',
	// 	phoneNumber: '+1-555-0110',
	// 	role: UserRoleEnum.ADMIN
	// },
	// {
	// 	email: 'testuser2@example.com',
	// 	password: 'TestPass2!',
	// 	fullName: 'Test User 2',
	// 	phoneNumber: '+1-555-0111',
	// 	role: UserRoleEnum.ADMIN
	// },
	// {
	// 	email: 'testuser3@example.com',
	// 	password: 'TestPass3!',
	// 	fullName: 'Test User 3',
	// 	phoneNumber: '+1-555-0112',
	// 	role: UserRoleEnum.ADMIN
	// },
	// {
	// 	email: 'testuser4@example.com',
	// 	password: 'TestPass4!',
	// 	fullName: 'Test User 4',
	// 	phoneNumber: '+1-555-0113',
	// 	role: UserRoleEnum.ADMIN
	// },
	// {
	// 	email: 'testuser5@example.com',
	// 	password: 'TestPass5!',
	// 	fullName: 'Test User 5',
	// 	phoneNumber: '+1-555-0114',
	// 	role: UserRoleEnum.ADMIN
	// },
	// {
	// 	email: 'testuser6@example.com',
	// 	password: 'TestPass6!',
	// 	fullName: 'Mike Customer',
	// 	phoneNumber: '+1-555-0109',
	// 	role: UserRoleEnum.UNKNOWN
	// },
	// {
	// 	email: 'testuser7@example.com',
	// 	password: 'TestPass7!',
	// 	fullName: 'Sarah Admin',
	// 	phoneNumber: '+1-555-0108',
	// 	role: UserRoleEnum.UNKNOWN,
	// 	isFirstLogin: true,
	// 	isActive: true,
	// },
	// {
	// 	email: 'testuser8@example.com',
	// 	password: 'TestPass8!',
	// 	fullName: 'Mike Customer',
	// 	phoneNumber: '+1-555-0109',
	// 	role: UserRoleEnum.UNKNOWN,
	// 	isFirstLogin: true,
	// 	isActive: true,
	// },
];
