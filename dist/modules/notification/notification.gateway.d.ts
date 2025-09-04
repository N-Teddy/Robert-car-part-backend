import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private readonly logger;
    private userSocketMap;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleMarkAsRead(client: Socket, data: {
        notificationId: string;
    }): Promise<void>;
    handleMarkAllAsRead(client: Socket): Promise<void>;
    sendNotificationToUser(userId: string, notification: any): void;
    sendBulkNotification(userIds: string[], notification: any): void;
}
