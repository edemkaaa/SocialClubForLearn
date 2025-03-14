import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ConversationType } from '../entities/conversation.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    enum: ConversationType,
    default: ConversationType.DIRECT,
    description: 'Тип чата: личный или групповой',
    example: 'direct',
  })
  @IsEnum(ConversationType)
  @IsOptional()
  type?: ConversationType = ConversationType.DIRECT;

  @ApiProperty({
    description: 'Название чата (обязательно для групповых чатов)',
    example: 'Рабочая группа',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'URL аватара чата',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'Список ID пользователей-участников чата',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  participants: number[]; // ID пользователей
}
