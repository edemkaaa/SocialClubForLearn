// src/posts/infrastructure/persistence/relational/entities/post.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { PostImage } from './post-image.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  user: UserEntity;

  @OneToMany(() => Comment, (comment: Comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like: Like) => like.post)
  likes: Like[];

  @OneToMany(() => PostImage, (image: PostImage) => image.post)
  images: PostImage[];

  @Column({ nullable: true })
  someField?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
