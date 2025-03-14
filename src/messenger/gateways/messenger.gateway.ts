import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessengerService } from '../services/messenger.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MarkReadDto } from '../dto/mark-read.dto';

/**
 * WebSocket Gateway для мессенджера
 * 
 * События для клиентов:
 * - 'newMessage': отправляется, когда пользователь получает новое сообщение
 * - 'messagesRead': отправляется, когда сообщения пользователя отмечаются как прочитанные
 * 
 * События от клиентов:
 * - 'sendMessage': отправка нового сообщения
 * - 'markAsRead': отметка сообщений как прочитанные
 */
@WebSocketGateway({
  namespace: 'messenger',
  cors: {
    origin: '*',
  },
})
export class MessengerGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger = new Logger('MessengerGateway');
  private userSocketMap = new Map<number, Socket[]>();

  constructor(
    private jwtService: JwtService,
    private messengerService: MessengerService,
  ) {}

  /**
   * Вызывается после инициализации Gateway
   */
  afterInit() {
    this.logger.log('MessengerGateway initialized');
  }

  /**
   * Обрабатывает новое подключение клиента
   * Аутентифицирует пользователя по JWT токену
   * Добавляет сокет в список подключений пользователя
   * Подключает клиента к комнатам чатов, в которых он участвует
   */
  async handleConnection(client: Socket, ...args: any[]): Promise<void> {
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

      // Устанавливаем идентификатор пользователя в данные сокета
      client.data.userId = userId;

      // Подключаем клиента к комнатам чатов, в которых он участвует
      await this.joinUserConversations(client, userId);

      this.logger.log(`Client connected: ${client.id} for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Обрабатывает отключение клиента
   * Удаляет сокет из списка подключений пользователя
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.userSocketMap.has(userId)) {
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

  /**
   * Присоединяет пользователя к комнатам чатов, в которых он участвует
   * @param client - Сокет клиента
   * @param userId - ID пользователя
   */
  private async joinUserConversations(client: Socket, userId: number) {
    try {
      const conversations =
        await this.messengerService.getUserConversations(userId);
      conversations.forEach((conversation) => {
        client.join(`conversation-${conversation.id}`);
      });
      this.logger.log(`User ${userId} joined conversation rooms`);
    } catch (error) {
      this.logger.error(`Error joining conversations: ${error.message}`);
    }
  }

  /**
   * Обрабатывает событие отправки сообщения через WebSocket
   * @param client - Сокет клиента
   * @param payload - Данные сообщения (CreateMessageDto)
   * @returns Результат отправки сообщения
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: CreateMessageDto) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        return { success: false, error: 'Unauthorized' };
      }

      const message = await this.messengerService.sendMessage(userId, payload);
      
      // Отправляем сообщение всем в комнате
      this.server
        .to(`conversation-${payload.conversationId}`)
        .emit('newMessage', message);
        
      return { success: true, message };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Обрабатывает событие пометки сообщений как прочитанные через WebSocket
   * @param client - Сокет клиента
   * @param payload - Данные для маркировки сообщений (ID чата и список ID сообщений)
   * @returns Результат маркировки сообщений
   */
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    client: Socket, 
    payload: { conversationId: number, messageIds: number[] }
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        return { success: false, error: 'Unauthorized' };
      }

      await this.messengerService.markMessagesAsRead(
        userId,
        payload.conversationId,
        payload.messageIds,
      );
      
      // Отправляем информацию о прочтении всем в комнате
      this.server
        .to(`conversation-${payload.conversationId}`)
        .emit('messagesRead', {
          userId,
          conversationId: payload.conversationId,
          messageIds: payload.messageIds
        });
        
      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking messages as read: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
