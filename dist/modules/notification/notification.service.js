"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const notification_entity_1 = require("../../entities/notification.entity");
const user_entity_1 = require("../../entities/user.entity");
const entity_enum_1 = require("../../common/enum/entity.enum");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationRepository, userRepository, configService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationService_1.name);
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('email.host'),
            port: this.configService.get('email.port'),
            secure: this.configService.get('email.secure'),
            auth: this.configService.get('email.secure')
                ? {
                    user: this.configService.get('email.user'),
                    pass: this.configService.get('email.pass'),
                }
                : undefined,
        });
        Handlebars.registerHelper('formatDate', (date) => {
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(date));
        });
    }
    async getAudienceRecipients(audience) {
        switch (audience) {
            case entity_enum_1.NotificationAudienceEnum.ADMINS:
                return this.userRepository.find({ where: { role: (0, typeorm_2.In)([entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.DEV]) } });
            case entity_enum_1.NotificationAudienceEnum.ALL_EXCEPT_UNKNOWN:
                return this.userRepository.find({ where: { role: (0, typeorm_2.In)([entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.DEV, entity_enum_1.UserRoleEnum.SALES, entity_enum_1.UserRoleEnum.CUSTOMER]) } });
            case entity_enum_1.NotificationAudienceEnum.ALL:
            default:
                return this.userRepository.find();
        }
    }
    async notifyAdminsOnNewUser(user) {
        try {
            const audience = entity_enum_1.NotificationAudienceEnum.ADMINS;
            const recipients = await this.getAudienceRecipients(audience);
            if (recipients.length === 0) {
                this.logger.warn('No recipients found for notification.');
                return { notified: 0 };
            }
            const title = 'New User Registration - Role Assignment Required';
            const adminPanelUrl = `${this.configService.get('app.frontendUrl')}/admin/users`;
            const notification = this.notificationRepository.create({
                type: entity_enum_1.NotificationEnum.SYSTEM_ALERT,
                title,
                message: `${user.fullName || user.email} registered and is awaiting role assignment.`,
                audience,
                metadata: {
                    newUserId: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    adminPanelUrl
                },
            });
            const savedNotification = await this.notificationRepository.save(notification);
            await Promise.all(recipients.map(async (recipient) => {
                try {
                    const html = this.renderTemplate('notify-admin-new-user', {
                        user: {
                            id: user.id,
                            email: user.email,
                            fullName: user.fullName || 'Not provided',
                            createdAt: user.createdAt
                        },
                        adminPanelUrl,
                        title: 'New User Registration'
                    });
                    await this.sendEmail({
                        to: recipient.email,
                        subject: title,
                        html,
                    });
                }
                catch (err) {
                    this.logger.error(`Failed to email ${recipient.email}: ${err.message}`);
                }
            }));
            savedNotification.emailSent = true;
            await this.notificationRepository.save(savedNotification);
            return { notified: recipients.length };
        }
        catch (err) {
            this.logger.error('Failed to notify admins on new user', err?.stack || String(err));
            throw new common_1.InternalServerErrorException('Failed to send notifications');
        }
    }
    async getUserNotifications(userId) {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user)
                return [];
            const visibleAudiences = [entity_enum_1.NotificationAudienceEnum.ALL, entity_enum_1.NotificationAudienceEnum.ALL_EXCEPT_UNKNOWN];
            if ([entity_enum_1.UserRoleEnum.ADMIN, entity_enum_1.UserRoleEnum.MANAGER, entity_enum_1.UserRoleEnum.DEV].includes(user.role)) {
                visibleAudiences.push(entity_enum_1.NotificationAudienceEnum.ADMINS);
            }
            return await this.notificationRepository.find({
                where: [
                    { audience: (0, typeorm_2.In)(visibleAudiences) },
                    { user: { id: userId } },
                ],
                order: { createdAt: 'DESC' },
            });
        }
        catch (err) {
            throw new common_1.InternalServerErrorException('Failed to fetch notifications');
        }
    }
    async getUnreadCount(userId) {
        try {
            const notifications = await this.getUserNotifications(userId);
            const count = notifications.filter((n) => !n.isRead).length;
            return { count };
        }
        catch (err) {
            throw new common_1.InternalServerErrorException('Failed to count unread notifications');
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { id: notificationId },
                relations: ['user'],
                select: {
                    id: true,
                    isRead: true,
                    user: { id: true },
                },
            });
            if (!notification) {
                throw new common_1.NotFoundException('Notification not found');
            }
            if (notification.user && notification.user.id !== userId) {
                throw new common_1.ForbiddenException('Cannot modify others\' notifications');
            }
            if (!notification.isRead) {
                await this.notificationRepository.update({ id: notification.id }, { isRead: true });
            }
            return { message: 'Notification marked as read' };
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException || err instanceof common_1.ForbiddenException) {
                throw err;
            }
            throw err;
        }
    }
    async sendEmail({ to, subject, html }) {
        const fromName = this.configService.get('email.defaultFromName');
        const fromEmail = this.configService.get('email.defaultFromEmail');
        const info = await this.transporter.sendMail({
            from: `${fromName} <${fromEmail}>`,
            to,
            subject,
            html,
        });
        this.logger.log(`Email sent: ${info.messageId}`);
        return info;
    }
    renderTemplate(templateName, context) {
        const templateDir = this.configService.get('email.templateDir') || 'templates/email';
        const layoutPath = path.resolve(templateDir, 'layout.hbs');
        const templatePath = path.resolve(templateDir, `${templateName}.hbs`);
        const layoutSrc = fs.readFileSync(layoutPath, 'utf8');
        const templateSrc = fs.readFileSync(templatePath, 'utf8');
        const layout = Handlebars.compile(layoutSrc);
        const content = Handlebars.compile(templateSrc)(context);
        return layout({ title: context.title || 'Car Parts Shop', body: content });
    }
    async notifyVehicleCreated(vehicle, createdByUser) {
        try {
            const audience = entity_enum_1.NotificationAudienceEnum.ADMINS;
            const recipients = await this.getAudienceRecipients(audience);
            if (recipients.length === 0) {
                this.logger.warn('No recipients found for vehicle creation notification.');
                return { notified: 0 };
            }
            const title = 'New Vehicle Added to Inventory';
            const vehicleUrl = `${this.configService.get('app.frontendUrl')}/admin/vehicles/${vehicle.id}`;
            const notification = this.notificationRepository.create({
                type: entity_enum_1.NotificationEnum.SYSTEM_ALERT,
                title,
                message: `New vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) added by ${createdByUser.fullName || createdByUser.email}.`,
                audience,
                metadata: {
                    vehicleId: vehicle.id,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    vin: vehicle.vin,
                    purchasePrice: vehicle.purchasePrice,
                    createdBy: createdByUser.id,
                    createdByEmail: createdByUser.email,
                    createdByFullName: createdByUser.fullName,
                    vehicleUrl
                },
            });
            await this.notificationRepository.save(notification);
            await Promise.all(recipients.map(async (recipient) => {
                try {
                    const html = this.renderTemplate('notify-vehicle-created', {
                        vehicle: {
                            make: vehicle.make,
                            model: vehicle.model,
                            year: vehicle.year,
                            vin: vehicle.vin,
                            purchasePrice: vehicle.purchasePrice,
                            description: vehicle.description,
                            auctionName: vehicle.auctionName,
                            createdAt: vehicle.createdAt
                        },
                        createdBy: {
                            fullName: createdByUser.fullName || 'Unknown User',
                            email: createdByUser.email
                        },
                        vehicleUrl
                    });
                    await this.sendEmail({
                        to: recipient.email,
                        subject: title,
                        html
                    });
                }
                catch (emailErr) {
                    this.logger.error(`Failed to send email to ${recipient.email}`, emailErr?.stack || String(emailErr));
                }
            }));
            return { notified: recipients.length };
        }
        catch (err) {
            this.logger.error('Failed to notify on vehicle creation', err?.stack || String(err));
            throw new common_1.InternalServerErrorException('Failed to send vehicle creation notifications');
        }
    }
    async notifyVehicleUpdated(vehicle, updatedByUser, changes) {
        try {
            const audience = entity_enum_1.NotificationAudienceEnum.ADMINS;
            const recipients = await this.getAudienceRecipients(audience);
            if (recipients.length === 0) {
                this.logger.warn('No recipients found for vehicle update notification.');
                return { notified: 0 };
            }
            const title = 'Vehicle Information Updated';
            const vehicleUrl = `${this.configService.get('app.frontendUrl')}/admin/vehicles/${vehicle.id}`;
            const notification = this.notificationRepository.create({
                type: entity_enum_1.NotificationEnum.SYSTEM_ALERT,
                title,
                message: `Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) updated by ${updatedByUser.fullName || updatedByUser.email}. Changes: ${changes.join(', ')}.`,
                audience,
                metadata: {
                    vehicleId: vehicle.id,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    vin: vehicle.vin,
                    changes,
                    updatedBy: updatedByUser.id,
                    updatedByEmail: updatedByUser.email,
                    updatedByFullName: updatedByUser.fullName,
                    vehicleUrl
                },
            });
            await this.notificationRepository.save(notification);
            await Promise.all(recipients.map(async (recipient) => {
                try {
                    const html = this.renderTemplate('notify-vehicle-updated', {
                        vehicle: {
                            make: vehicle.make,
                            model: vehicle.model,
                            year: vehicle.year,
                            vin: vehicle.vin,
                            changes
                        },
                        updatedBy: {
                            fullName: updatedByUser.fullName || 'Unknown User',
                            email: updatedByUser.email
                        },
                        vehicleUrl
                    });
                    await this.sendEmail({
                        to: recipient.email,
                        subject: title,
                        html
                    });
                }
                catch (emailErr) {
                    this.logger.error(`Failed to send email to ${recipient.email}`, emailErr?.stack || String(emailErr));
                }
            }));
            return { notified: recipients.length };
        }
        catch (err) {
            this.logger.error('Failed to notify on vehicle update', err?.stack || String(err));
            throw new common_1.InternalServerErrorException('Failed to send vehicle update notifications');
        }
    }
    async notifyVehicleDeleted(vehicle, deletedByUser) {
        try {
            const audience = entity_enum_1.NotificationAudienceEnum.ADMINS;
            const recipients = await this.getAudienceRecipients(audience);
            if (recipients.length === 0) {
                this.logger.warn('No recipients found for vehicle deletion notification.');
                return { notified: 0 };
            }
            const title = 'Vehicle Removed from Inventory';
            const adminUrl = `${this.configService.get('app.frontendUrl')}/admin/vehicles`;
            const notification = this.notificationRepository.create({
                type: entity_enum_1.NotificationEnum.SYSTEM_ALERT,
                title,
                message: `Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) with VIN ${vehicle.vin} was removed by ${deletedByUser.fullName || deletedByUser.email}.`,
                audience,
                metadata: {
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    vin: vehicle.vin,
                    deletedBy: deletedByUser.id,
                    deletedByEmail: deletedByUser.email,
                    deletedByFullName: deletedByUser.fullName,
                    adminUrl
                },
            });
            await this.notificationRepository.save(notification);
            await Promise.all(recipients.map(async (recipient) => {
                try {
                    const html = this.renderTemplate('notify-vehicle-deleted', {
                        vehicle: {
                            make: vehicle.make,
                            model: vehicle.model,
                            year: vehicle.year,
                            vin: vehicle.vin
                        },
                        deletedBy: {
                            fullName: deletedByUser.fullName || 'Unknown User',
                            email: deletedByUser.email
                        },
                        adminUrl
                    });
                    await this.sendEmail({
                        to: recipient.email,
                        subject: title,
                        html
                    });
                }
                catch (emailErr) {
                    this.logger.error(`Failed to send email to ${recipient.email}`, emailErr?.stack || String(emailErr));
                }
            }));
            return { notified: recipients.length };
        }
        catch (err) {
            this.logger.error('Failed to notify on vehicle deletion', err?.stack || String(err));
            throw new common_1.InternalServerErrorException('Failed to send vehicle deletion notifications');
        }
    }
    async notifyVehiclePartedOut(vehicle, updatedByUser) {
        try {
            const audience = entity_enum_1.NotificationAudienceEnum.ADMINS;
            const recipients = await this.getAudienceRecipients(audience);
            const title = 'Vehicle Marked as Parted Out';
            const vehicleUrl = `${this.configService.get('app.frontendUrl')}/admin/vehicles/${vehicle.id}`;
            const notification = this.notificationRepository.create({
                type: entity_enum_1.NotificationEnum.SYSTEM_ALERT,
                title,
                message: `Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.year}) has been marked as parted out by ${updatedByUser.fullName || updatedByUser.email}.`,
                audience,
                metadata: {
                    vehicleId: vehicle.id,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    vin: vehicle.vin,
                    updatedBy: updatedByUser.id,
                    updatedByEmail: updatedByUser.email,
                    updatedByFullName: updatedByUser.fullName,
                    vehicleUrl
                },
            });
            await this.notificationRepository.save(notification);
            await Promise.all(recipients.map(async (recipient) => {
                try {
                    const html = this.renderTemplate('notify-vehicle-parted-out', {
                        vehicle: {
                            make: vehicle.make,
                            model: vehicle.model,
                            year: vehicle.year,
                            vin: vehicle.vin
                        },
                        updatedBy: {
                            fullName: updatedByUser.fullName || 'Unknown User',
                            email: updatedByUser.email
                        },
                        vehicleUrl
                    });
                    await this.sendEmail({
                        to: recipient.email,
                        subject: title,
                        html
                    });
                }
                catch (emailErr) {
                    this.logger.error(`Failed to send email to ${recipient.email}`, emailErr?.stack || String(emailErr));
                }
            }));
            return { notified: recipients.length };
        }
        catch (err) {
            this.logger.error('Failed to notify on vehicle parted out', err?.stack || String(err));
            throw new common_1.InternalServerErrorException('Failed to send vehicle parted out notifications');
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map