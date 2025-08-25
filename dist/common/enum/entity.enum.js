"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationAudienceEnum = exports.AuditActionEnum = exports.UserRoleEnum = exports.ReportPeriodEnum = exports.ReportTypeEnum = exports.DeliveryMethodEnum = exports.OrderStatusEnum = exports.NotificationEnum = exports.ImageEnum = void 0;
var ImageEnum;
(function (ImageEnum) {
    ImageEnum["USER_PROFILE"] = "USER PROFILE";
    ImageEnum["VEHICLE"] = "VEHICLE";
    ImageEnum["PART"] = "PART";
})(ImageEnum || (exports.ImageEnum = ImageEnum = {}));
var NotificationEnum;
(function (NotificationEnum) {
    NotificationEnum["ORDER_CREATED"] = "ORDER CREATED";
    NotificationEnum["ORDER_UPDATED"] = "ORDER UPDATED";
    NotificationEnum["LOW_STOCK"] = "LOW STOCK";
    NotificationEnum["PROFIT_ALERT"] = "PROFIT ALERT";
    NotificationEnum["PART_REQUEST"] = "PART REQUEST";
    NotificationEnum["SYSTEM_ALERT"] = "SYSTEM ALERT";
})(NotificationEnum || (exports.NotificationEnum = NotificationEnum = {}));
var OrderStatusEnum;
(function (OrderStatusEnum) {
    OrderStatusEnum["PENDING"] = "PENDING";
    OrderStatusEnum["PROCESSING"] = "PROCESSING";
    OrderStatusEnum["COMPLETED"] = "COMPLETED";
    OrderStatusEnum["CANCELLED"] = "CANCELLED";
})(OrderStatusEnum || (exports.OrderStatusEnum = OrderStatusEnum = {}));
var DeliveryMethodEnum;
(function (DeliveryMethodEnum) {
    DeliveryMethodEnum["PICKUP"] = "PICKUP";
    DeliveryMethodEnum["SHIPPING"] = "SHIPPING";
})(DeliveryMethodEnum || (exports.DeliveryMethodEnum = DeliveryMethodEnum = {}));
var ReportTypeEnum;
(function (ReportTypeEnum) {
    ReportTypeEnum["SALES"] = "SALES";
    ReportTypeEnum["INVENTORY"] = "INVENTORY";
    ReportTypeEnum["PROFIT"] = "PROFIT";
})(ReportTypeEnum || (exports.ReportTypeEnum = ReportTypeEnum = {}));
var ReportPeriodEnum;
(function (ReportPeriodEnum) {
    ReportPeriodEnum["DAILY"] = "DAILY";
    ReportPeriodEnum["WEEKLY"] = "WEEKLY";
    ReportPeriodEnum["MONTHLY"] = "MONTHLY";
    ReportPeriodEnum["YEARLY"] = "YEARLY";
    ReportPeriodEnum["CUSTOM"] = "CUSTOM";
})(ReportPeriodEnum || (exports.ReportPeriodEnum = ReportPeriodEnum = {}));
var UserRoleEnum;
(function (UserRoleEnum) {
    UserRoleEnum["ADMIN"] = "ADMIN";
    UserRoleEnum["MANAGER"] = "MANAGER";
    UserRoleEnum["DEV"] = "DEV";
    UserRoleEnum["SALES"] = "SALES";
    UserRoleEnum["CUSTOMER"] = "CUSTOMER";
    UserRoleEnum["UNKNOWN"] = "UNKNOWN";
})(UserRoleEnum || (exports.UserRoleEnum = UserRoleEnum = {}));
var AuditActionEnum;
(function (AuditActionEnum) {
    AuditActionEnum["CREATE"] = "CREATE";
    AuditActionEnum["UPDATE"] = "UPDATE";
    AuditActionEnum["DELETE"] = "DELETE";
    AuditActionEnum["LOGIN"] = "LOGIN";
    AuditActionEnum["LOGOUT"] = "LOGOUT";
})(AuditActionEnum || (exports.AuditActionEnum = AuditActionEnum = {}));
var NotificationAudienceEnum;
(function (NotificationAudienceEnum) {
    NotificationAudienceEnum["ALL"] = "ALL";
    NotificationAudienceEnum["ALL_EXCEPT_UNKNOWN"] = "ALL_EXCEPT_UNKNOWN";
    NotificationAudienceEnum["ADMINS"] = "ADMINS";
})(NotificationAudienceEnum || (exports.NotificationAudienceEnum = NotificationAudienceEnum = {}));
//# sourceMappingURL=entity.enum.js.map