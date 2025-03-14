import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { FileEntity } from '../../../../../files/infrastructure/persistence/relational/entities/file.entity';
import { Like } from '../../../../../posts/infrastructure/persistence/relational/entities/like.entity';
import { PostEntity } from '../../../../../posts/infrastructure/persistence/relational/entities/post.entity';
import { Comment } from '../../../../../posts/infrastructure/persistence/relational/entities/comment.entity';
import { NotificationEntity } from '../../../../../notifications/infrastructure/persistence/relational/entities/notification.entity';

import { AuthProvidersEnum } from '../../../../../auth/auth-providers.enum';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity('user')
export class UserEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  // Для строки рекомендуется указывать type: 'varchar'
  // unique: true означает, что поле email должно быть уникальным
  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  password?: string;

  @Column({ default: AuthProvidersEnum.email })
  provider: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  socialId?: string | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @OneToOne(() => FileEntity, {
    eager: true,
  })
  @JoinColumn()
  photo?: FileEntity | null;

  @ManyToOne(() => RoleEntity, {
    eager: true,
  })
  role?: RoleEntity | null;

  @ManyToOne(() => StatusEntity, {
    eager: true,
  })
  status?: StatusEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Связь с лайками
  @OneToMany(() => Like, (like: Like) => like.user)
  likes: Like[];

  // Связь с постами
  @OneToMany(() => PostEntity, (post: PostEntity) => post.user)
  posts: PostEntity[];

  // Связь с комментариями
  @OneToMany(() => Comment, (comment: Comment) => comment.user)
  comments: Comment[];

  // Добавляем связи для уведомлений
  @OneToMany(() => NotificationEntity, (notification) => notification.recipient)
  receivedNotifications: NotificationEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.sender)
  sentNotifications: NotificationEntity[];
}
