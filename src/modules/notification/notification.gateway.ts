import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { instrument } from "@socket.io/admin-ui";
import { IoAdapter } from '@nestjs/platform-socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('WebSocket server initialized');
  }

  private readonly logger = new Logger(NotificationGateway.name);
  private userSocketMap = new Map<string, string[]>(); // userId -> socketIds[]

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      // Store the mapping
      if (!this.userSocketMap.has(userId)) {
        this.userSocketMap.set(userId, []);
      }
      this.userSocketMap.get(userId)?.push(client.id);

      // Join user-specific room
      client.join(`user-${userId}`);

      // Join role-based rooms
      if (payload.role) {
        client.join(`role-${payload.role}`);
      }

      client.data.userId = userId;
      client.data.role = payload.role;

      this.logger.log(`Client connected: ${client.id}, User: ${userId}`);

      // Send connection success
      client.emit('connected', { userId, socketId: client.id });

    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId) {
      const sockets = this.userSocketMap.get(userId) || [];
      const index = sockets.indexOf(client.id);
      if (index > -1) {
        sockets.splice(index, 1);
      }

      if (sockets.length === 0) {
        this.userSocketMap.delete(userId);
      } else {
        this.userSocketMap.set(userId, sockets);
      }
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() notificationId: string,
  ) {
    const userId = client.data.userId;

    // Emit to all user's sockets
    this.server.to(`user-${userId}`).emit('notificationRead', { notificationId });

    return { success: true, notificationId };
  }

  // Send notification to specific user
  sendToUser(userId: string, notification: any) {
    this.server.to(`user-${userId}`).emit('notification', notification);
  }

  // Send notification to multiple users
  sendToUsers(userIds: string[], notification: any) {
    userIds.forEach(userId => {
      this.sendToUser(userId, notification);
    });
  }

  // Send notification to role
  sendToRole(role: string, notification: any) {
    this.server.to(`role-${role}`).emit('notification', notification);
  }

  // Send to all connected clients
  sendToAll(notification: any) {
    this.server.emit('notification', notification);
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userSocketMap.size;
  }

  // Check if user is connected
  isUserConnected(userId: string): boolean {
    return this.userSocketMap.has(userId) && this.userSocketMap.get(userId)!.length > 0;
  }
}