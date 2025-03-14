import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import type { Conversation } from './conversation.entity';

export enum MessageStatus {
  SENT = 'sent', // Отправлено
  DELIVERED = 'delivered', // Доставлено
  READ = 'read', // Прочитано
}

export enum MessageType {
  TEXT = 'text', // Текстовое сообщение
  IMAGE = 'image', // Изображение
  FILE = 'file', // Файл
  VOICE = 'voice', // Голосовое сообщение
  VIDEO = 'video', // Видео
  LOCATION = 'location', // Геолокация
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('Conversation', (conversation: any) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'sender_id' })
  sender: UserEntity;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({ default: false })
  isEdited: boolean;

  @Column('jsonb', { nullable: true })
  metadata: any; // Для хранения дополнительных данных (например, размер файла, координаты и т.д.)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
