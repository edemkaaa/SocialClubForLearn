import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { ChatMessage } from '../../messenger/entities/chat-message.entity';

export enum ConversationType {
  DIRECT = 'direct', // Личный чат между двумя пользователями
  GROUP = 'group', // Групповой чат
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.DIRECT,
  })
  type: ConversationType;

  @Column({ nullable: true })
  name: string; // Имя для группового чата

  @Column({ nullable: true })
  avatar: string; // Аватар для группового чата

  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'conversation_participants',
    joinColumn: { name: 'conversation_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  participants: UserEntity[];

  @OneToMany('ChatMessage', (message: any) => message.conversation)
  messages: ChatMessage[];

  @Column({ nullable: true })
  lastMessageId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
