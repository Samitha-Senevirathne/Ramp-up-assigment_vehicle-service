
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// notifications.gateway.ts
@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway {
  @WebSocketServer() server: Server;
  private clients = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) this.clients.set(userId, client.id);
    console.log(`Client connected: ${client.id}, userId: ${userId}`);
  }

  handleDisconnect(client: Socket) {
    this.clients.forEach((socketId, userId) => {
      if (socketId === client.id) this.clients.delete(userId);
    });
    console.log(`Client disconnected: ${client.id}`);
  }

  sendNotificationToUser(userId: string, message: string,url?: string ) {
    const socketId = this.clients.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', { message,url, timestamp: new Date() });
    }
  }
}
