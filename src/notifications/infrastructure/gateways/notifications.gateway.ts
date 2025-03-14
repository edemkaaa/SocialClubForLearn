import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationEntity } from '../persistence/relational/entities/notification.entity';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', // В продакшене здесь должен быть список разрешенных доменов
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger = new Logger('NotificationsGateway');
  private userSocketMap = new Map<number, Socket[]>();

  constructor(private jwtService: JwtService) {}

  afterInit() {
    this.logger.log('NotificationsGateway initialized');
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        this.logger.error('No token provided');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.id;

      if (!userId) {
        this.logger.error('Invalid token - no user ID');
        client.disconnect();
        return;
      }

      // Сохраняем сокет пользователя
      if (!this.userSocketMap.has(userId)) {
        this.userSocketMap.set(userId, []);
      }
      const userSockets = this.userSocketMap.get(userId);
      if (userSockets) {
        userSockets.push(client);
      }

      this.logger.log(`Client connected: ${client.id} for user: ${userId}`);

      // Устанавливаем идентификатор пользователя в данные сокета
      client.data.userId = userId;
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.userSocketMap.has(userId)) {
      // Удаляем сокет из списка
      const userSockets = this.userSocketMap.get(userId);
      if (userSockets) {
        const updatedSockets = userSockets.filter(
          (socket) => socket.id !== client.id,
        );

        if (updatedSockets.length === 0) {
          this.userSocketMap.delete(userId);
        } else {
          this.userSocketMap.set(userId, updatedSockets);
        }
      }
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @OnEvent('notification.created')
  handleNotificationCreated(notification: NotificationEntity) {
    this.logger.log(`Notification created: ${JSON.stringify(notification)}`);

    const recipientId = notification.recipient.id;

    // Отправляем уведомление только получателю
    if (this.userSocketMap.has(recipientId)) {
      const recipientSockets = this.userSocketMap.get(recipientId);

      if (recipientSockets) {
        recipientSockets.forEach((socket) => {
          socket.emit('newNotification', notification);
        });

        this.logger.log(`Notification sent to user: ${recipientId}`);
      }
    } else {
      this.logger.log(`User ${recipientId} is not connected`);
    }
  }
}
