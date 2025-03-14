import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationEntity,
  NotificationType,
} from '../../infrastructure/persistence/relational/entities/notification.entity';
import { CreateNotificationDto } from '../../dto/create-notification.dto';
import { UserEntity } from '../../../users/infrastructure/persistence/relational/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationsRepository: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    const { recipientId, senderId, ...rest } = createNotificationDto;

    // Находим отправителя и получателя
    const recipient = await this.usersRepository.findOneBy({ id: recipientId });
    const sender = await this.usersRepository.findOneBy({ id: senderId });

    if (!recipient || !sender) {
      throw new Error('Recipient or sender not found');
    }

    // Создаем уведомление
    const notification = this.notificationsRepository.create({
      recipient,
      sender,
      ...rest,
    });

    const savedNotification =
      await this.notificationsRepository.save(notification);

    // Отправляем событие для WebSocket
    this.eventEmitter.emit('notification.created', savedNotification);

    return savedNotification;
  }

  async findAllForUser(userId: number): Promise<NotificationEntity[]> {
    return this.notificationsRepository.find({
      where: { recipient: { id: userId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number): Promise<NotificationEntity> {
    const notification = await this.notificationsRepository.findOneBy({ id });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.update(
      { recipient: { id: userId }, isRead: false },
      { isRead: true },
    );
  }

  async remove(id: number): Promise<void> {
    await this.notificationsRepository.delete(id);
  }
}
