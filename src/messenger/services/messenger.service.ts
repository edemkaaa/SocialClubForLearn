import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Conversation, ConversationType } from '../entities/conversation.entity';
import { ChatMessage, MessageStatus } from '../entities/chat-message.entity';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class MessengerService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  // Создание нового чата
  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    const { participants, name, type = ConversationType.DIRECT, avatar } = createConversationDto;

    // Находим участников
    const users = await this.userRepository.find({
      where: { id: In(participants) },
    });

    if (users.length !== participants.length) {
      throw new NotFoundException('Некоторые пользователи не найдены');
    }

    // Создаем новый чат
    const conversation = this.conversationRepository.create({
      type,
      name,
      avatar,
      participants: users,
    });

    return this.conversationRepository.save(conversation);
  }

  // Получение списка чатов пользователя
  async getUserConversations(userId: number): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: {
        participants: {
          id: userId,
        },
      },
      relations: ['participants'],
    });
  }

  // Получение конкретного чата
  async getConversationById(id: number): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Чат не найден');
    }

    return conversation;
  }

  // Отправка сообщения
  async sendMessage(userId: number, messageDto: CreateMessageDto): Promise<ChatMessage> {
    const { conversationId, content, type } = messageDto;

    // Проверяем, что отправитель существует
    const sender = await this.userRepository.findOne({
      where: { id: userId },
    });

    // Проверяем, что чат существует
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!sender || !conversation) {
      throw new NotFoundException('Отправитель или чат не найден');
    }

    // Проверяем, что отправитель является участником чата
    const isParticipant = conversation.participants.some(
      (participant) => participant.id === userId,
    );

    if (!isParticipant) {
      throw new NotFoundException('Пользователь не является участником чата');
    }

    // Создаем новое сообщение
    const message = this.messageRepository.create({
      content,
      type,
      sender,
      conversation,
      status: MessageStatus.SENT,
    });

    return this.messageRepository.save(message);
  }

  // Получение сообщений чата
  async getConversationMessages(conversationId: number, userId: number): Promise<ChatMessage[]> {
    // Проверяем, что чат существует
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Чат не найден');
    }

    // Проверяем, что пользователь является участником чата
    const isParticipant = conversation.participants.some(
      (participant) => participant.id === userId,
    );

    if (!isParticipant) {
      throw new NotFoundException('Пользователь не является участником чата');
    }

    // Возвращаем сообщения
    return this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  // Отметить сообщения как прочитанные
  async markMessagesAsRead(
    userId: number,
    conversationId: number,
    messageIds: number[],
  ): Promise<void> {
    // Проверяем, что чат существует
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Чат не найден');
    }

    // Проверяем, что пользователь является участником чата
    const isParticipant = conversation.participants.some(
      (participant) => participant.id === userId,
    );

    if (!isParticipant) {
      throw new NotFoundException('Пользователь не является участником чата');
    }

    // Обновляем статус сообщений
    await this.messageRepository.update(
      {
        id: In(messageIds),
        conversation: { id: conversationId },
        sender: { id: Not(userId) }, // Не отмечаем как прочитанные собственные сообщения
      },
      { status: MessageStatus.READ },
    );
  }
}
