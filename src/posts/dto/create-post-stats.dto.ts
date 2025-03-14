import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreatePostStatsDto {
  @IsNumber()
  views: number;

  @IsNumber()
  likes: number;

  @IsNumber()
  comments: number;

  @IsOptional()
  @IsBoolean()
  isLiked?: boolean;
}
