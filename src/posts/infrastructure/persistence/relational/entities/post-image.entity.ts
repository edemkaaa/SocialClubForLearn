import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity('post_images')
export class PostImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  src: string;

  @Column()
  alt: string;

  @ManyToOne(() => PostEntity, (post) => post.images)
  post: PostEntity;
}
