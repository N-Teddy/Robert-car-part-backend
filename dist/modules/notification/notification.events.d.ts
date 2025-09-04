import { NotificationPriority, NotificationType } from "src/common/enum/notification.enum";
export declare class NotificationEvent {
    userId: string;
    type: NotificationType;
    priority?: NotificationPriority;
    data: Record<string, any>;
    metadata?: Record<string, any>;
}
export declare class UserRegisteredEvent extends NotificationEvent {
    type: NotificationType;
}
export declare class PasswordResetRequestedEvent extends NotificationEvent {
    type: NotificationType;
}
export declare class PasswordChangedEvent extends NotificationEvent {
    type: NotificationType;
}
export declare class RoleAssignedEvent extends NotificationEvent {
    type: NotificationType;
}
export declare class VehicleCreatedEvent extends NotificationEvent {
    type: NotificationType;
}
export declare class VehicleUpdatedEvent extends NotificationEvent {
    type: NotificationType;
}
export declare class VehicleDeletedEvent extends NotificationEvent {
    type: NotificationType;
}
export declare class VehiclePartedOutEvent extends NotificationEvent {
    type: NotificationType;
}
