import { ApiProperty } from '@nestjs/swagger';
import { MessageStatus, MessageType } from '../entities/chat-message.entity';
import { UserResponseDto } from './conversation.response.dto';

export class MessageResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: MessageType, example: 'text' })
  type: MessageType;

  @ApiProperty({ example: 'Привет, как дела?' })
  content: string;

  @ApiProperty({ enum: MessageStatus, example: 'sent' })
  status: MessageStatus;

  @ApiProperty({ example: false })
  isEdited: boolean;

  @ApiProperty({
    example: { fileSize: 1024, fileName: 'document.pdf' },
    required: false,
  })
  metadata: any;

  @ApiProperty({ example: '2025-03-11T00:05:49.960Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-03-11T00:05:49.960Z' })
  updatedAt: Date;

  @ApiProperty({ type: UserResponseDto })
  sender: UserResponseDto;
}
