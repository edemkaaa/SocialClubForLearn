import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePostImageDto {
  @IsString()
  @IsNotEmpty()
  src: string;

  @IsString()
  @IsNotEmpty()
  alt: string;
}
