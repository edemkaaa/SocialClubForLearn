import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MessageType } from '../entities/chat-message.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    description: 'ID чата, в который отправляется сообщение',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  conversationId: number;

  @ApiProperty({
    enum: MessageType,
    default: MessageType.TEXT,
    description: 'Тип сообщения: текст, изображение, файл и т.д.',
    example: 'text',
  })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @ApiProperty({
    description: 'Содержимое сообщения',
    example: 'Привет, как дела?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Дополнительные метаданные сообщения (размер файла, координаты и т.д.)',
    required: false,
    example: { fileSize: 1024, fileName: 'document.pdf' },
  })
  @IsOptional()
  metadata?: any;
}
