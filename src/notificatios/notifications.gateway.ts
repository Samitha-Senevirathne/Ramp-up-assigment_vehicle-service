import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';


@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway {

    //to access the socekt.io server instance
  @WebSocketServer() server: Server;  

  private clients = new Map<string, string>(); // stores mapping userId to socketId
  private logger = new Logger('NotificationsGateway');

  handleConnection(client: Socket) {
    try {
      const userId = client.handshake.query.userId as string;
      if (userId) this.clients.set(userId, client.id);
      this.logger.log(`Client connected: ${client.id}, userId: ${userId}`);
    } catch (error) {
      this.logger.error(`Error while connnecting client:${error.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    try {
      this.clients.forEach((socketId, userId) => {
        if (socketId === client.id) this.clients.delete(userId); //loop through all the stored mappings find which userId has this socketId and delete
      });
      console.log(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error(`Error while disconnecting client: ${error.message}`);
    }
  }

  sendNotificationToUser(userId: string, message: string, url?: string) {
    try {
      const socketId = this.clients.get(userId);
      if (socketId) {
        this.server
          .to(socketId)
          .emit('notification', { message, url, timestamp: new Date() });
        this.logger.log(`Notification sent to user: ${userId}`);
      }
    } catch (error) {
      this.logger.error(`error while sending notification:${error.message}`);
    }
  }
}
