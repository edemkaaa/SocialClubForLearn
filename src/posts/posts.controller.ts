// src/posts/posts.controller.ts

import {
  Controller,
  Get,
  Post as HttpPost,
  Body,
  Param,
  ParseIntPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { PostEntity } from './infrastructure/persistence/relational/entities/post.entity';
import { Comment } from './infrastructure/persistence/relational/entities/comment.entity';
import { Like } from './infrastructure/persistence/relational/entities/like.entity';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateLikeDto } from './dto/create-like.dto';

@ApiTags('Posts')
@Controller('v1/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // ---- POSTS ----
  @HttpPost()
  @ApiOperation({ summary: 'Создать новый пост' })
  @ApiResponse({ status: 201, description: 'Пост успешно создан.' })
  @ApiResponse({ status: 400, description: 'Некорректные данные.' })
  async createPost(@Body() dto: CreatePostDto): Promise<PostEntity> {
    return this.postsService.createPost(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все посты' })
  @ApiResponse({ status: 200, description: 'Список постов.' })
  async getPosts(): Promise<PostEntity[]> {
    return this.postsService.findAllPosts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пост по ID' })
  @ApiResponse({ status: 200, description: 'Пост найден.' })
  @ApiResponse({ status: 404, description: 'Пост не найден.' })
  async getPostById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostEntity> {
    return this.postsService.findPostById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить пост по ID' })
  @ApiResponse({ status: 200, description: 'Пост успешно обновлен.' })
  @ApiResponse({ status: 404, description: 'Пост не найден.' })
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.updatePost(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить пост по ID' })
  @ApiResponse({ status: 204, description: 'Пост успешно удален.' })
  @ApiResponse({ status: 404, description: 'Пост не найден.' })
  async removePost(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postsService.removePost(id);
  }

  // ---- COMMENTS ----
  @HttpPost(':postId/comments')
  async createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
  ): Promise<Comment> {
    return this.postsService.createComment(postId, dto);
  }

  // ---- LIKES ----
  @HttpPost('likes')
  async createLike(@Body() dto: CreateLikeDto): Promise<Like> {
    return this.postsService.createLike(dto);
  }
}
