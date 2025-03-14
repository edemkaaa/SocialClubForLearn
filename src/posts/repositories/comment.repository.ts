// src/posts/repositories/comment.repository.ts

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../infrastructure/persistence/relational/entities/comment.entity';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(private dataSource: DataSource) {
    super(Comment, dataSource.createEntityManager());
  }

  async findReplies(parentId: string): Promise<Comment[]> {
    return this.find({ where: { parentId } });
  }
}
