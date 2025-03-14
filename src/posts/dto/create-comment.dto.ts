// src/posts/dto/create-comment.dto.ts

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  authorName: string;

  @IsString()
  @IsNotEmpty()
  authorAvatar: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  // userId, если сразу привязываем к пользователю
  @IsOptional()
  userId?: number;
}
