import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostRepository } from './repositories/post.repository';
import { CommentRepository } from './repositories/comment.repository';
import { LikeRepository } from './repositories/like.repository';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { SearchService } from '../search/search.service';

import { PostEntity } from './infrastructure/persistence/relational/entities/post.entity';
import { Comment } from './infrastructure/persistence/relational/entities/comment.entity';
import { Like } from './infrastructure/persistence/relational/entities/like.entity';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateLikeDto } from './dto/create-like.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
    private readonly likeRepository: LikeRepository,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(PostEntity)
    private readonly postEntityRepository: Repository<PostEntity>,

    @InjectRepository(Comment)
    private readonly commentEntityRepository: Repository<Comment>,

    @InjectRepository(Like)
    private readonly likeEntityRepository: Repository<Like>,

    private readonly searchService: SearchService,
  ) {}

  // ---- POST ----
  async createPost(dto: CreatePostDto): Promise<PostEntity> {
    const { userId, title, content, imageUrl } = dto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID=${userId} not found`);
    }

    const post = this.postRepository.create({
      title,
      content,
      imageUrl,
      user,
    });

    const savedPost = await this.postRepository.save(post);

    // Индексируем созданный пост в Elasticsearch
    try {
      await this.searchService.indexPost(savedPost);
    } catch (error) {
      // В случае ошибки индексации продолжаем работу, но логируем ошибку
      console.error('Ошибка индексации поста:', error);
    }

    return savedPost;
  }

  async findAllPosts(): Promise<PostEntity[]> {
    return this.postRepository.find({
      relations: ['user', 'comments', 'likes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPostById(id: number): Promise<PostEntity> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'comments', 'likes'],
    });
    if (!post) {
      throw new NotFoundException(`Post with ID=${id} not found`);
    }
    return post;
  }

  async updatePost(id: number, dto: UpdatePostDto): Promise<PostEntity> {
    const post = await this.findPostById(id);
    Object.assign(post, dto);

    const updatedPost = await this.postRepository.save(post);

    // Обновляем пост в Elasticsearch
    try {
      await this.searchService.indexPost(updatedPost);
    } catch (error) {
      console.error('Ошибка обновления индексации поста:', error);
    }

    return updatedPost;
  }

  async removePost(id: number): Promise<void> {
    const post = await this.findPostById(id);
    await this.postRepository.remove(post);

    // Удаляем пост из Elasticsearch
    try {
      await this.searchService.removePostFromIndex(id);
    } catch (error) {
      console.error('Ошибка удаления поста из индекса:', error);
    }
  }

  // ---- COMMENT ----
  async createComment(postId: number, dto: CreateCommentDto): Promise<Comment> {
    const post = await this.findPostById(postId);
    const { text, authorName, authorAvatar, userId } = dto;

    let user: UserEntity | undefined = undefined;
    if (userId) {
      const foundUser = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!foundUser) {
        throw new NotFoundException(`User with ID=${userId} not found`);
      }
      user = foundUser;
    }

    // Создаем объект для comment с корректными типами
    const commentData: Partial<Comment> = {
      text,
      authorName,
      authorAvatar,
      post,
      user,
    };

    const comment = this.commentRepository.create(commentData);
    const savedComment = await this.commentRepository.save(comment);

    // Индексируем созданный комментарий в Elasticsearch
    try {
      await this.searchService.indexComment(savedComment);
    } catch (error) {
      console.error('Ошибка индексации комментария:', error);
    }

    return savedComment;
  }

  // ---- LIKE ----
  async createLike(dto: CreateLikeDto): Promise<Like> {
    const { userId, postId } = dto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID=${userId} not found`);
    }

    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID=${postId} not found`);
    }

    // Проверяем, существует ли лайк от этого юзера на этот пост
    const existingLike = await this.likeRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });
    if (existingLike) {
      return existingLike; // уже лайкнул
    }

    const like = this.likeRepository.create({ user, post });
    return this.likeRepository.save(like);
  }

  async findPostsByUserId(userId: number): Promise<PostEntity[]> {
    return this.postRepository.find({ where: { user: { id: userId } } });
  }
}
