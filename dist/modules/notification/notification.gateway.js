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
    afterInit() {
        this.logger.log('WebSocket server initialized');
    }
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(NotificationGateway_1.name);
        this.userSocketMap = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = await this.jwtService.verifyAsync(token);
            const userId = payload.sub;
            if (!this.userSocketMap.has(userId)) {
                this.userSocketMap.set(userId, []);
            }
            this.userSocketMap.get(userId)?.push(client.id);
            client.join(`user-${userId}`);
            if (payload.role) {
                client.join(`role-${payload.role}`);
            }
            client.data.userId = userId;
            client.data.role = payload.role;
            this.logger.log(`Client connected: ${client.id}, User: ${userId}`);
            client.emit('connected', { userId, socketId: client.id });
        }
        catch (error) {
            this.logger.error(`Connection failed: ${error.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
        if (userId) {
            const sockets = this.userSocketMap.get(userId) || [];
            const index = sockets.indexOf(client.id);
            if (index > -1) {
                sockets.splice(index, 1);
            }
            if (sockets.length === 0) {
                this.userSocketMap.delete(userId);
            }
            else {
                this.userSocketMap.set(userId, sockets);
            }
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleMarkAsRead(client, notificationId) {
        const userId = client.data.userId;
        this.server.to(`user-${userId}`).emit('notificationRead', { notificationId });
        return { success: true, notificationId };
    }
    sendToUser(userId, notification) {
        this.server.to(`user-${userId}`).emit('notification', notification);
    }
    sendToUsers(userIds, notification) {
        userIds.forEach(userId => {
            this.sendToUser(userId, notification);
        });
    }
    sendToRole(role, notification) {
        this.server.to(`role-${role}`).emit('notification', notification);
    }
    sendToAll(notification) {
        this.server.emit('notification', notification);
    }
    getConnectedUsersCount() {
        return this.userSocketMap.size;
    }
    isUserConnected(userId) {
        return this.userSocketMap.has(userId) && this.userSocketMap.get(userId).length > 0;
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('markAsRead'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleMarkAsRead", null);
exports.NotificationGateway = NotificationGateway = NotificationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
            credentials: true,
        },
        namespace: '/notifications',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map