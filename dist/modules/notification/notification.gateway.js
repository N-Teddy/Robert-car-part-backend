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
var NotificationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
let NotificationGateway = NotificationGateway_1 = class NotificationGateway {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(NotificationGateway_1.name);
        this.userSocketMap = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = await this.jwtService.verify(token);
            const userId = payload.sub;
            client.data.userId = userId;
            const existingSockets = this.userSocketMap.get(userId) || [];
            existingSockets.push(client.id);
            this.userSocketMap.set(userId, existingSockets);
            client.join(`user:${userId}`);
            this.logger.log(`User ${userId} connected with socket ${client.id}`);
            client.emit('connected', { userId });
        }
        catch (error) {
            this.logger.error('Connection authentication failed', error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
        if (userId) {
            const sockets = this.userSocketMap.get(userId) || [];
            const updatedSockets = sockets.filter(id => id !== client.id);
            if (updatedSockets.length > 0) {
                this.userSocketMap.set(userId, updatedSockets);
            }
            else {
                this.userSocketMap.delete(userId);
            }
            this.logger.log(`User ${userId} disconnected from socket ${client.id}`);
        }
    }
    async handleMarkAsRead(client, data) {
        const userId = client.data.userId;
        this.server.to(`user:${userId}`).emit('notification-read', {
            notificationId: data.notificationId,
            readAt: new Date(),
        });
    }
    async handleMarkAllAsRead(client) {
        const userId = client.data.userId;
        this.server.to(`user:${userId}`).emit('all-notifications-read', {
            readAt: new Date(),
        });
    }
    sendNotificationToUser(userId, notification) {
        this.server.to(`user:${userId}`).emit('new-notification', notification);
        this.logger.log(`Sent notification to user ${userId}`);
    }
    sendBulkNotification(userIds, notification) {
        userIds.forEach(userId => {
            this.sendNotificationToUser(userId, notification);
        });
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark-as-read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleMarkAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark-all-as-read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleMarkAllAsRead", null);
exports.NotificationGateway = NotificationGateway = NotificationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
            credentials: true,
        },
        namespace: 'notifications',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map