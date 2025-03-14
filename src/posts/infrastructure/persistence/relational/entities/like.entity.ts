// src/posts/infrastructure/persistence/relational/entities/like.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  // Явно указываем тип (post: Post) => post.likes
  @ManyToOne(() => PostEntity, (post: PostEntity) => post.likes)
  post: PostEntity;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.likes)
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;
}
