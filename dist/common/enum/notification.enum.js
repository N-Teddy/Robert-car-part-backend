"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationStatus = exports.NotificationPriority = exports.NotificationChannel = exports.NotificationType = void 0;
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
    NotificationChannel["PUSH"] = "push";
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
    NotificationStatus["QUEUED"] = "queued";
    NotificationStatus["PROCESSING"] = "processing";
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["DELIVERED"] = "delivered";
    NotificationStatus["FAILED"] = "failed";
    NotificationStatus["RETRY"] = "retry";
    NotificationStatus["READ"] = "read";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
//# sourceMappingURL=notification.enum.js.map