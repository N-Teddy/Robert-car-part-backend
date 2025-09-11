export declare enum NotificationType {
    WELCOME = "welcome",
    PASSWORD_RESET = "password_reset",
    PASSWORD_CHANGED = "password_changed",
    NEW_DEVICE_LOGIN = "new_device_login",
    ROLE_ASSIGNED = "role_assigned",
    PROFILE_UPDATED = "profile_updated",
    ACCOUNT_ACTIVATED = "account_activated",
    ACCOUNT_DEACTIVATED = "account_deactivated",
    EMAIL_VERIFICATION = "email_verification",
    VEHICLE_CREATED = "vehicle_created",
    VEHICLE_UPDATED = "vehicle_updated",
    VEHICLE_DELETED = "vehicle_deleted",
    VEHICLE_PARTED_OUT = "vehicle_parted_out",
    NEW_CATEGORY = "new_category",
    CATEGORY_UPDATED = "category_updated",
    SYSTEM_ANNOUNCEMENT = "system_announcement"
}
export declare enum NotificationChannel {
    EMAIL = "email",
    IN_APP = "in_app"
}
export declare enum NotificationPriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum NotificationStatus {
    PENDING = "pending",
    SENT = "sent",
    DELIVERED = "delivered",
    FAILED = "failed",
    RETRY = "retry",
    READ = "read"
}
export declare enum NotificationEnum {
    SYSTEM_MAINTENANCE = "SYSTEM_MAINTENANCE",
    SYSTEM_UPDATE = "SYSTEM_UPDATE",
    WELCOME = "WELCOME",
    PASSWORD_RESET = "PASSWORD_RESET",
    PASSWORD_CHANGED = "PASSWORD_CHANGED",
    ACCOUNT_VERIFIED = "ACCOUNT_VERIFIED",
    ROLE_ASSIGNED = "ROLE_ASSIGNED",
    PROFILE_UPDATED = "PROFILE_UPDATED",
    USER_UPDATED = "USER_UPDATED",
    USER_DELETED = "USER_DELETED",
    VEHICLE_CREATED = "VEHICLE_CREATED",
    VEHICLE_UPDATED = "VEHICLE_UPDATED",
    VEHICLE_DELETED = "VEHICLE_DELETED",
    VEHICLE_PARTED_OUT = "VEHICLE_PARTED_OUT",
    PART_CREATED = "PART_CREATED",
    PART_UPDATED = "PART_UPDATED",
    PART_SOLD = "PART_SOLD",
    PART_LOW_STOCK = "PART_LOW_STOCK",
    ORDER_CREATED = "ORDER_CREATED",
    ORDER_UPDATED = "ORDER_UPDATED",
    ORDER_COMPLETED = "ORDER_COMPLETED",
    ORDER_CANCELLED = "ORDER_CANCELLED",
    REPORT_GENERATED = "REPORT_GENERATED",
    REPORT_READY = "REPORT_READY"
}
export declare enum NotificationAudienceEnum {
    ALL = "ALL",
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    STAFF = "STAFF",
    SPECIFIC_USER = "SPECIFIC_USER"
}
export declare enum NotificationChannelEnum {
    EMAIL = "EMAIL",
    WEBSOCKET = "WEBSOCKET",
    BOTH = "BOTH"
}
