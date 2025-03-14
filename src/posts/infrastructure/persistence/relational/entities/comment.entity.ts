// src/posts/infrastructure/persistence/relational/entities/comment.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  authorName: string;

  @Column()
  authorAvatar: string;

  @Column('text')
  text: string;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: false })
  isLiked: boolean;

  // Для вложенных комментариев
  @Column({ nullable: true })
  parentId?: string;

  // Самоссылочная связь (опциональна)
  @ManyToOne(() => Comment, (comment: Comment) => comment.replies, {
    nullable: true,
  })
  parent?: Comment;

  @OneToMany(() => Comment, (comment: Comment) => comment.parent)
  replies?: Comment[];

  // Принадлежит посту
  @ManyToOne(() => PostEntity, (post: PostEntity) => post.comments)
  post: PostEntity;

  // Принадлежит пользователю
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.comments, {
    nullable: true,
  })
  user?: UserEntity;

  @CreateDateColumn()
  createdAt: Date;
}
