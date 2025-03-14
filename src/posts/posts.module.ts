// src/posts/posts.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Сущности:
import { PostEntity } from './infrastructure/persistence/relational/entities/post.entity';
import { Comment } from './infrastructure/persistence/relational/entities/comment.entity';
import { Like } from './infrastructure/persistence/relational/entities/like.entity';
import { PostImage } from './infrastructure/persistence/relational/entities/post-image.entity';

// Репозитории (кастомные):
import { PostRepository } from './repositories/post.repository';
import { CommentRepository } from './repositories/comment.repository';
import { LikeRepository } from './repositories/like.repository';

// Сервис и контроллер
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

// Если вы привязываете пользователей, импортируйте и User:
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      Comment,
      Like,
      PostImage,
      UserEntity,
    ]),
  ],
  providers: [PostsService, PostRepository, CommentRepository, LikeRepository],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
