export enum NotificationType {
    // Auth related
    WELCOME = 'welcome',
    PASSWORD_RESET = 'password_reset',
    PASSWORD_CHANGED = 'password_changed',
    NEW_DEVICE_LOGIN = 'new_device_login',
    ROLE_ASSIGNED = 'role_assigned',

    // User related
    PROFILE_UPDATED = 'profile_updated',
    ACCOUNT_ACTIVATED = 'account_activated',
    ACCOUNT_DEACTIVATED = 'account_deactivated',
    EMAIL_VERIFICATION = 'email_verification',

    // Vehicle related
    VEHICLE_CREATED = 'vehicle_created',
    VEHICLE_UPDATED = 'vehicle_updated',
    VEHICLE_DELETED = 'vehicle_deleted',
    VEHICLE_PARTED_OUT = 'vehicle_parted_out',

    // Category related
    NEW_CATEGORY = 'new_category',
    CATEGORY_UPDATED = 'category_updated',

    // System
    SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

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

    // Vehicle notifications
    VEHICLE_CREATED = 'VEHICLE_CREATED',
    VEHICLE_UPDATED = 'VEHICLE_UPDATED',
    VEHICLE_DELETED = 'VEHICLE_DELETED',
    VEHICLE_PARTED_OUT = 'VEHICLE_PARTED_OUT',

    // Part notifications
    PART_CREATED = 'PART_CREATED',
    PART_UPDATED = 'PART_UPDATED',
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
