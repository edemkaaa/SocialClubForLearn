import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiResponse, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('v1/chat')
@Controller('v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Получить ответ от чата' })
  @ApiBody({
    description: 'Сообщение пользователя',
    type: String,
    examples: {
      example1: {
        value: ' { "content": "Привет, как дела?" }',
        summary: 'Пример сообщения',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Успешный ответ', type: String })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 500, description: 'Ошибка сервера' })
  async getChatResponse(
    @Body() dto: CreateMessageDto,
    @Request() req,
  ): Promise<{ reply: string }> {
    const { content } = dto;
    const userId = req.user.id;

    if (!userId) {
      throw new ForbiddenException(
        'Зарегистрируйся, чтобы пользоваться ассистентом.',
      );
    }

    const username = req.user.firstname;
    if (!username) {
      throw new ForbiddenException('Не удалось получить ник пользователя.');
    }

    const reply = await this.chatService.createUserMessage({ content });
    return { reply: `${username}: ${reply}` };
  }

  @Get()
  async findAll() {
    return this.chatService.findAll();
  }
}
