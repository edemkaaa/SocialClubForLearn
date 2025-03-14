import { ApiProperty } from '@nestjs/swagger';
import { ConversationType } from '../entities/conversation.entity';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;
}

export class ConversationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: ConversationType, example: 'direct' })
  type: ConversationType;

  @ApiProperty({ example: 'Рабочая группа', required: false })
  name: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  avatar: string;

  @ApiProperty({ example: 5, required: false })
  lastMessageId: number;

  @ApiProperty({ example: '2025-03-11T00:05:49.960Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-03-11T00:05:49.960Z' })
  updatedAt: Date;

  @ApiProperty({ type: [UserResponseDto] })
  participants: UserResponseDto[];
} 