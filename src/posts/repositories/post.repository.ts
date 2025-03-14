// src/posts/repositories/post.repository.ts

import { Injectable } from '@nestjs/common';
import { DataSource, Repository, EntityRepository } from 'typeorm';
import { PostEntity } from '../infrastructure/persistence/relational/entities/post.entity';

@EntityRepository(PostEntity)
export class PostRepository extends Repository<PostEntity> {
  constructor(private dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
  }

  // Пример
  async findByAuthor(authorName: string): Promise<PostEntity[]> {
    return this.createQueryBuilder('post')
      .innerJoinAndSelect('post.user', 'user')
      .where('user.name = :authorName', { authorName })
      .getMany();
  }

  async findPostsByUserId(userId: number): Promise<PostEntity[]> {
    return this.find({ where: { user: { id: userId } } });
  }
}
