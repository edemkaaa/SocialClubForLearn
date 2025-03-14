import { IsNumber } from 'class-validator';

export class CreateLikeDto {
  @IsNumber()
  userId?: number;

  @IsNumber()
  postId?: number;
}
