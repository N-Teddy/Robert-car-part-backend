export enum NotificationChannel {
	EMAIL = 'email',
	IN_APP = 'in_app',
}

export enum NotificationPriority {
	CRITICAL = 'critical',
	HIGH = 'high',
	MEDIUM = 'medium',
	LOW = 'low',
}

export enum NotificationStatus {
	PENDING = 'pending',
	SENT = 'sent',
	DELIVERED = 'delivered',
	FAILED = 'failed',
	RETRY = 'retry',
	READ = 'read',
}

export enum NotificationEnum {
	// System notifications
	SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
	SYSTEM_UPDATE = 'SYSTEM_UPDATE',

	// User notifications
	WELCOME = 'WELCOME',
	PASSWORD_RESET = 'PASSWORD_RESET',
	PASSWORD_CHANGED = 'PASSWORD_CHANGED',
	ACCOUNT_VERIFIED = 'ACCOUNT_VERIFIED',
	ROLE_ASSIGNED = 'ROLE_ASSIGNED',
	PROFILE_UPDATED = 'PROFILE_UPDATED',
	USER_UPDATED = 'USER_UPDATED',
	USER_DELETED = 'USER_DELETED',

	// Vehicle notifications
	VEHICLE_CREATED = 'VEHICLE_CREATED',
	VEHICLE_UPDATED = 'VEHICLE_UPDATED',
	VEHICLE_DELETED = 'VEHICLE_DELETED',
	VEHICLE_PARTED_OUT = 'VEHICLE_PARTED_OUT',

	// Part notifications
	PART_CREATED = 'PART_CREATED',
	PART_UPDATED = 'PART_UPDATED',
	PART_DELETED = 'PART_DELETED',
	PART_SOLD = 'PART_SOLD',
	PART_LOW_STOCK = 'PART_LOW_STOCK',

	// Order notifications
	ORDER_CREATED = 'ORDER_CREATED',
	ORDER_UPDATED = 'ORDER_UPDATED',
	ORDER_COMPLETED = 'ORDER_COMPLETED',
	ORDER_CANCELLED = 'ORDER_CANCELLED',

	// Report notifications
	REPORT_GENERATED = 'REPORT_GENERATED',
	REPORT_READY = 'REPORT_READY',

	// Category notifications
	CATEGORY_CREATED = 'CATEGORY_CREATED',
	CATEGORY_UPDATED = 'CATEGORY_UPDATED',
	CATEGORY_DELETED = 'CATEGORY_DELETED',
	REORDER_CATEGORIES = 'REORDER_CATEGORIES',
}

export enum NotificationAudienceEnum {
	ALL = 'ALL', // Everyone
	ADMIN = 'ADMIN', // DEV, MANAGER, ADMIN
	MANAGER = 'MANAGER', // MANAGER and above
	STAFF = 'STAFF', // STAFF and above
	SPECIFIC_USER = 'SPECIFIC_USER', // Specific user(s)
}

export enum NotificationChannelEnum {
	EMAIL = 'EMAIL',
	WEBSOCKET = 'WEBSOCKET',
	BOTH = 'BOTH',
}
