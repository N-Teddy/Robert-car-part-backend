export enum ImageEnum {
	USER_PROFILE = 'USER PROFILE',
	VEHICLE = 'VEHICLE',
	PART = 'PART',
	QR_CODE = 'QR_CODE',
	CATEGORY = 'CATEGORY',
}

export enum OrderStatusEnum {
	PENDING = 'PENDING',
	PROCESSING = 'PROCESSING',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
}

export enum DeliveryMethodEnum {
	PICKUP = 'PICKUP',
	SHIPPING = 'SHIPPING',
}

export enum ReportTypeEnum {
	SALES = 'SALES',
	INVENTORY = 'INVENTORY',
	PROFIT = 'PROFIT',
}

export enum ReportPeriodEnum {
	DAILY = 'DAILY',
	WEEKLY = 'WEEKLY',
	MONTHLY = 'MONTHLY',
	YEARLY = 'YEARLY',
	CUSTOM = 'CUSTOM',
}

export enum UserRoleEnum {
	ADMIN = 'ADMIN',
	MANAGER = 'MANAGER',
	DEV = 'DEV',
	SALES = 'SALES',
	STAFF = 'STAFF',
	CUSTOMER = 'CUSTOMER',
	UNKNOWN = 'UNKNOWN',
}

export enum AuditActionEnum {
	CREATE = 'CREATE',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	LOGIN = 'LOGIN',
	LOGOUT = 'LOGOUT',
	REGISTER = 'REGISTER',
	OTHER = 'OTHER',
}


