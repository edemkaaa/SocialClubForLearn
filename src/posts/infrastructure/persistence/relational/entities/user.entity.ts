import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PostEntity } from './post.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  // Связь: у одного пользователя много постов
  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  // Связь: у одного пользователя много комментариев
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  // Связь: у одного пользователя много лайков
  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];
}
