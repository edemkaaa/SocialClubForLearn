// src/posts/repositories/like.repository.ts

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Like } from '../infrastructure/persistence/relational/entities/like.entity';

@Injectable()
export class LikeRepository extends Repository<Like> {
  constructor(private dataSource: DataSource) {
    super(Like, dataSource.createEntityManager());
  }

  async findLikesByUser(userId: number): Promise<Like[]> {
    return this.find({ where: { user: { id: userId } } });
  }
}
