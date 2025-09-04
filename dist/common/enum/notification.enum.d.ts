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
    IN_APP = "in_app",
    PUSH = "push"
}
export declare enum NotificationPriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum NotificationStatus {
    PENDING = "pending",
    QUEUED = "queued",
    PROCESSING = "processing",
    SENT = "sent",
    DELIVERED = "delivered",
    FAILED = "failed",
    RETRY = "retry",
    READ = "read"
}
