"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclePartedOutEvent = exports.VehicleDeletedEvent = exports.VehicleUpdatedEvent = exports.VehicleCreatedEvent = exports.RoleAssignedEvent = exports.PasswordChangedEvent = exports.PasswordResetRequestedEvent = exports.UserRegisteredEvent = exports.NotificationEvent = void 0;
const notification_enum_1 = require("../../common/enum/notification.enum");
class NotificationEvent {
}
exports.NotificationEvent = NotificationEvent;
class UserRegisteredEvent extends NotificationEvent {
    constructor() {
        super(...arguments);
        this.type = notification_enum_1.NotificationType.WELCOME;
    }
}
exports.UserRegisteredEvent = UserRegisteredEvent;
class PasswordResetRequestedEvent extends NotificationEvent {
    constructor() {
        super(...arguments);
        this.type = notification_enum_1.NotificationType.PASSWORD_RESET;
    }
}
exports.PasswordResetRequestedEvent = PasswordResetRequestedEvent;
class PasswordChangedEvent extends NotificationEvent {
    constructor() {
        super(...arguments);
        this.type = notification_enum_1.NotificationType.PASSWORD_CHANGED;
    }
}
exports.PasswordChangedEvent = PasswordChangedEvent;
class RoleAssignedEvent extends NotificationEvent {
    constructor() {
        super(...arguments);
        this.type = notification_enum_1.NotificationType.ROLE_ASSIGNED;
    }
}
exports.RoleAssignedEvent = RoleAssignedEvent;
class VehicleCreatedEvent extends NotificationEvent {
    constructor() {
        super(...arguments);
        this.type = notification_enum_1.NotificationType.VEHICLE_CREATED;
    }
}
exports.VehicleCreatedEvent = VehicleCreatedEvent;
class VehicleUpdatedEvent extends NotificationEvent {
    constructor() {
        super(...arguments);
        this.type = notification_enum_1.NotificationType.VEHICLE_UPDATED;
    }
}
exports.VehicleUpdatedEvent = VehicleUpdatedEvent;
class VehicleDeletedEvent extends NotificationEvent {
    constructor() {
        super(...arguments);
        this.type = notification_enum_1.NotificationType.VEHICLE_DELETED;
    }
}
exports.VehicleDeletedEvent = VehicleDeletedEvent;
class VehiclePartedOutEvent extends NotificationEvent {
    constructor() {
        super(...arguments);
        this.type = notification_enum_1.NotificationType.VEHICLE_PARTED_OUT;
    }
}
exports.VehiclePartedOutEvent = VehiclePartedOutEvent;
//# sourceMappingURL=notification.events.js.map