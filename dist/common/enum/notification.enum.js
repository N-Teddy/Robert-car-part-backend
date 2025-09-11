"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationChannelEnum = exports.NotificationAudienceEnum = exports.NotificationEnum = exports.NotificationStatus = exports.NotificationPriority = exports.NotificationChannel = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["WELCOME"] = "welcome";
    NotificationType["PASSWORD_RESET"] = "password_reset";
    NotificationType["PASSWORD_CHANGED"] = "password_changed";
    NotificationType["NEW_DEVICE_LOGIN"] = "new_device_login";
    NotificationType["ROLE_ASSIGNED"] = "role_assigned";
    NotificationType["PROFILE_UPDATED"] = "profile_updated";
    NotificationType["ACCOUNT_ACTIVATED"] = "account_activated";
    NotificationType["ACCOUNT_DEACTIVATED"] = "account_deactivated";
    NotificationType["EMAIL_VERIFICATION"] = "email_verification";
    NotificationType["VEHICLE_CREATED"] = "vehicle_created";
    NotificationType["VEHICLE_UPDATED"] = "vehicle_updated";
    NotificationType["VEHICLE_DELETED"] = "vehicle_deleted";
    NotificationType["VEHICLE_PARTED_OUT"] = "vehicle_parted_out";
    NotificationType["NEW_CATEGORY"] = "new_category";
    NotificationType["CATEGORY_UPDATED"] = "category_updated";
    NotificationType["SYSTEM_ANNOUNCEMENT"] = "system_announcement";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["IN_APP"] = "in_app";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["CRITICAL"] = "critical";
    NotificationPriority["HIGH"] = "high";
    NotificationPriority["MEDIUM"] = "medium";
    NotificationPriority["LOW"] = "low";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "pending";
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["DELIVERED"] = "delivered";
    NotificationStatus["FAILED"] = "failed";
    NotificationStatus["RETRY"] = "retry";
    NotificationStatus["READ"] = "read";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
var NotificationEnum;
(function (NotificationEnum) {
    NotificationEnum["SYSTEM_MAINTENANCE"] = "SYSTEM_MAINTENANCE";
    NotificationEnum["SYSTEM_UPDATE"] = "SYSTEM_UPDATE";
    NotificationEnum["WELCOME"] = "WELCOME";
    NotificationEnum["PASSWORD_RESET"] = "PASSWORD_RESET";
    NotificationEnum["PASSWORD_CHANGED"] = "PASSWORD_CHANGED";
    NotificationEnum["ACCOUNT_VERIFIED"] = "ACCOUNT_VERIFIED";
    NotificationEnum["ROLE_ASSIGNED"] = "ROLE_ASSIGNED";
    NotificationEnum["PROFILE_UPDATED"] = "PROFILE_UPDATED";
    NotificationEnum["USER_UPDATED"] = "USER_UPDATED";
    NotificationEnum["USER_DELETED"] = "USER_DELETED";
    NotificationEnum["VEHICLE_CREATED"] = "VEHICLE_CREATED";
    NotificationEnum["VEHICLE_UPDATED"] = "VEHICLE_UPDATED";
    NotificationEnum["VEHICLE_DELETED"] = "VEHICLE_DELETED";
    NotificationEnum["VEHICLE_PARTED_OUT"] = "VEHICLE_PARTED_OUT";
    NotificationEnum["PART_CREATED"] = "PART_CREATED";
    NotificationEnum["PART_UPDATED"] = "PART_UPDATED";
    NotificationEnum["PART_SOLD"] = "PART_SOLD";
    NotificationEnum["PART_LOW_STOCK"] = "PART_LOW_STOCK";
    NotificationEnum["ORDER_CREATED"] = "ORDER_CREATED";
    NotificationEnum["ORDER_UPDATED"] = "ORDER_UPDATED";
    NotificationEnum["ORDER_COMPLETED"] = "ORDER_COMPLETED";
    NotificationEnum["ORDER_CANCELLED"] = "ORDER_CANCELLED";
    NotificationEnum["REPORT_GENERATED"] = "REPORT_GENERATED";
    NotificationEnum["REPORT_READY"] = "REPORT_READY";
})(NotificationEnum || (exports.NotificationEnum = NotificationEnum = {}));
var NotificationAudienceEnum;
(function (NotificationAudienceEnum) {
    NotificationAudienceEnum["ALL"] = "ALL";
    NotificationAudienceEnum["ADMIN"] = "ADMIN";
    NotificationAudienceEnum["MANAGER"] = "MANAGER";
    NotificationAudienceEnum["STAFF"] = "STAFF";
    NotificationAudienceEnum["SPECIFIC_USER"] = "SPECIFIC_USER";
})(NotificationAudienceEnum || (exports.NotificationAudienceEnum = NotificationAudienceEnum = {}));
var NotificationChannelEnum;
(function (NotificationChannelEnum) {
    NotificationChannelEnum["EMAIL"] = "EMAIL";
    NotificationChannelEnum["WEBSOCKET"] = "WEBSOCKET";
    NotificationChannelEnum["BOTH"] = "BOTH";
})(NotificationChannelEnum || (exports.NotificationChannelEnum = NotificationChannelEnum = {}));
//# sourceMappingURL=notification.enum.js.map