export declare enum ImageEnum {
    USER_PROFILE = "USER PROFILE",
    VEHICLE = "VEHICLE",
    PART = "PART",
    QR_CODE = "QR_CODE",
    CATEGORY = "CATEGORY"
}
export declare enum NotificationEnum {
    ORDER_CREATED = "ORDER CREATED",
    ORDER_UPDATED = "ORDER UPDATED",
    LOW_STOCK = "LOW STOCK",
    PROFIT_ALERT = "PROFIT ALERT",
    PART_REQUEST = "PART REQUEST",
    SYSTEM_ALERT = "SYSTEM ALERT"
}
export declare enum OrderStatusEnum {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum DeliveryMethodEnum {
    PICKUP = "PICKUP",
    SHIPPING = "SHIPPING"
}
export declare enum ReportTypeEnum {
    SALES = "SALES",
    INVENTORY = "INVENTORY",
    PROFIT = "PROFIT"
}
export declare enum ReportPeriodEnum {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
    CUSTOM = "CUSTOM"
}
export declare enum UserRoleEnum {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    DEV = "DEV",
    SALES = "SALES",
    CUSTOMER = "CUSTOMER",
    UNKNOWN = "UNKNOWN"
}
export declare enum AuditActionEnum {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT"
}
export declare enum NotificationAudienceEnum {
    ALL = "ALL",
    ALL_EXCEPT_UNKNOWN = "ALL_EXCEPT_UNKNOWN",
    ADMINS = "ADMINS"
}
