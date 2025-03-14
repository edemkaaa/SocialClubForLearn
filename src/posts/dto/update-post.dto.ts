import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiProperty({ description: 'Название поста', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Содержимое поста', required: false })
  @IsString()
  @IsOptional()
  content?: string;
}
