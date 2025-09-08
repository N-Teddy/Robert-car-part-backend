import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    server: Server;
    private readonly logger;
    private userSocketMap;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleMarkAsRead(client: Socket, notificationId: string): Promise<{
        success: boolean;
        notificationId: string;
    }>;
    sendToUser(userId: string, notification: any): void;
    sendToUsers(userIds: string[], notification: any): void;
    sendToRole(role: string, notification: any): void;
    sendToAll(notification: any): void;
    getConnectedUsersCount(): number;
    isUserConnected(userId: string): boolean;
}
