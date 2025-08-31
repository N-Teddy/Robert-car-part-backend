export enum ImageEnum {
	USER_PROFILE = 'USER PROFILE',
	VEHICLE = 'VEHICLE',
	PART = 'PART',
	QR_CODE = 'QR_CODE',
	CATEGORY = 'CATEGORY',
}

export enum NotificationEnum {
	ORDER_CREATED = 'ORDER CREATED',
	ORDER_UPDATED = 'ORDER UPDATED',
	LOW_STOCK = 'LOW STOCK',
	PROFIT_ALERT = 'PROFIT ALERT',
	PART_REQUEST = 'PART REQUEST',
	SYSTEM_ALERT = 'SYSTEM ALERT',
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
	CUSTOMER = 'CUSTOMER',
	UNKNOWN = 'UNKNOWN',
}

export enum AuditActionEnum {
	CREATE = 'CREATE',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	LOGIN = 'LOGIN',
	LOGOUT = 'LOGOUT',
}

export enum NotificationAudienceEnum {
	ALL = 'ALL',
	ALL_EXCEPT_UNKNOWN = 'ALL_EXCEPT_UNKNOWN',
	ADMINS = 'ADMINS',
}
