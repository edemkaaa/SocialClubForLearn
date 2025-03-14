import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiProperty({
    description: 'Список ID сообщений для отметки как прочитанные',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNotEmpty()
  messageIds: number[];
} 