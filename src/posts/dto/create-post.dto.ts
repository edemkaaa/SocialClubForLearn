import {
  IsString,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePostImageDto } from './create-post-image.dto';
import { CreatePostStatsDto } from './create-post-stats.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Название поста' })
  @IsString()
  @IsNotEmpty()
  title: string; // Добавлено поле title

  @ApiProperty({ description: 'Имя автора' })
  @IsString()
  @IsNotEmpty()
  authorName: string;

  @ApiProperty({ description: 'Аватар автора' })
  @IsString()
  @IsNotEmpty()
  authorAvatar: string;

  @ApiProperty({ description: 'Дата поста в формате ISO' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Текст поста', type: [String] })
  @IsArray()
  @IsString({ each: true })
  text: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePostImageDto)
  images?: CreatePostImageDto[];

  @ValidateNested()
  @Type(() => CreatePostStatsDto)
  stats: CreatePostStatsDto;

  @ApiProperty({ description: 'Выделить пост' })
  @IsBoolean()
  highlighted: boolean;

  @ApiProperty({ description: 'Показать комментарии' })
  @IsBoolean()
  showComments: boolean;

  @ApiProperty({ description: 'Содержимое поста' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'URL изображения', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'ID пользователя' })
  @IsNotEmpty()
  userId: number; // ID пользователя, который создает пост
}
