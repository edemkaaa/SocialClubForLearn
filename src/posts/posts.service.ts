// src/posts/posts.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostRepository } from './repositories/post.repository';
import { CommentRepository } from './repositories/comment.repository';
import { LikeRepository } from './repositories/like.repository';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';

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
  ) {}

  // ---- POST ----
  async createPost(dto: CreatePostDto): Promise<PostEntity> {
    const user = await this.userRepository.findOneBy({ id: dto.userId });

    if (!user) {
      throw new Error(`User with ID ${dto.userId} not found`);
    }

    const post = this.postRepository.create({ ...dto, user });
    return this.postRepository.save(post);
  }

  async findAllPosts(): Promise<PostEntity[]> {
    return this.postRepository.find();
  }

  async findPostById(id: number): Promise<PostEntity> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID=${id} not found`);
    }
    return post;
  }

  async updatePost(id: number, dto: UpdatePostDto): Promise<PostEntity> {
    await this.postRepository.update(id, dto);

    const updatedPost = await this.postRepository.findOneBy({ id });

    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return updatedPost;
  }

  async removePost(id: number): Promise<void> {
    const post = await this.findPostById(id);
    await this.postRepository.remove(post);
  }

  // ---- COMMENT ----
  async createComment(postId: number, dto: CreateCommentDto): Promise<Comment> {
    const post = await this.findPostById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID=${postId} not found`);
    }
    const comment = this.commentRepository.create({ ...dto, post });
    return this.commentRepository.save(comment);
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
