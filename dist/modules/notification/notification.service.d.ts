import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { CreateNotificationDto, UpdateNotificationPreferencesDto, GetNotificationsQueryDto } from '../../dto/request/notification.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NotificationGateway } from './notification.gateway';
export declare class NotificationService {
    private notificationRepository;
    private userRepository;
    private notificationQueue;
    private configService;
    private eventEmitter;
    private auditLogService;
    private notificationGateway;
    private readonly logger;
    private transporter;
    private emailTemplates;
    private readonly retryInterval;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<User>, notificationQueue: Queue, configService: ConfigService, eventEmitter: EventEmitter2, auditLogService: AuditLogService, notificationGateway: NotificationGateway);
    private initializeEmailTransporter;
    private loadEmailTemplates;
    createNotification(dto: CreateNotificationDto): Promise<Notification>;
    private shouldSendNotification;
    private queueNotification;
    private getDelayForPriority;
    processNotification(notificationId: string): Promise<void>;
    private sendEmailNotification;
    private sendInAppNotification;
    private handleNotificationError;
    private getEmailTemplate;
    getUserNotifications(userId: string, query: GetNotificationsQueryDto): Promise<{
        notifications: Notification[];
        total: number;
    }>;
    markAsRead(userId: string, notificationId: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    updateUserPreferences(userId: string, preferences: UpdateNotificationPreferencesDto): Promise<User>;
    cleanupOldNotifications(): Promise<void>;
    handleUserRegistered(payload: {
        userId: string;
        email: string;
        name: string;
    }): Promise<void>;
    handlePasswordResetRequested(payload: {
        userId: string;
        resetToken: string;
    }): Promise<void>;
    handlePasswordChanged(payload: {
        userId: string;
    }): Promise<void>;
    handleRoleAssigned(payload: {
        userId: string;
        role: string;
    }): Promise<void>;
    handleVehicleCreated(payload: {
        userId: string;
        vehicleId: string;
        vehicleName: string;
    }): Promise<void>;
    handleVehicleUpdated(payload: {
        userId: string;
        vehicleId: string;
        vehicleName: string;
    }): Promise<void>;
    handleVehicleDeleted(payload: {
        userId: string;
        vehicleName: string;
    }): Promise<void>;
    handleVehiclePartedOut(payload: {
        userId: string;
        vehicleId: string;
        vehicleName: string;
    }): Promise<void>;
}
