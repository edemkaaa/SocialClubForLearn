import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { MessengerService } from '../services/messenger.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { AuthGuard } from '@nestjs/passport';
import { 
  ApiTags, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiParam, 
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { ConversationResponseDto } from '../dto/conversation.response.dto';
import { MessageResponseDto } from '../dto/message.response.dto';
import { MarkReadDto } from '../dto/mark-read.dto';

@ApiTags('v1/messenger')
@Controller('v1/messenger')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MessengerController {
  constructor(private readonly messengerService: MessengerService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список чатов пользователя' })
  @ApiOkResponse({ 
    description: 'Список чатов успешно получен', 
    type: [ConversationResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  async getUserConversations(@Request() req) {
    return this.messengerService.getUserConversations(req.user.id);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Создать новый чат' })
  @ApiBody({ type: CreateConversationDto })
  @ApiCreatedResponse({ 
    description: 'Чат успешно создан', 
    type: ConversationResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req,
  ) {
    // Добавляем текущего пользователя в список участников, если его там нет
    if (!createConversationDto.participants.includes(req.user.id)) {
      createConversationDto.participants.push(req.user.id);
    }
    
    return this.messengerService.createConversation(createConversationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить информацию о чате' })
  @ApiParam({ name: 'id', description: 'ID чата', type: 'number' })
  @ApiOkResponse({ 
    description: 'Информация о чате успешно получена', 
    type: ConversationResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiNotFoundResponse({ description: 'Чат не найден' })
  async getConversation(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.messengerService.getConversationById(id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Получить сообщения чата' })
  @ApiParam({ name: 'id', description: 'ID чата', type: 'number' })
  @ApiOkResponse({ 
    description: 'Сообщения чата успешно получены', 
    type: [MessageResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiForbiddenResponse({ description: 'Доступ запрещен' })
  @ApiNotFoundResponse({ description: 'Чат не найден или пользователь не является участником' })
  async getConversationMessages(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.messengerService.getConversationMessages(id, req.user.id);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Отправить новое сообщение' })
  @ApiBody({ type: CreateMessageDto })
  @ApiCreatedResponse({ 
    description: 'Сообщение успешно отправлено', 
    type: MessageResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiForbiddenResponse({ description: 'Доступ запрещен' })
  @ApiNotFoundResponse({ description: 'Чат не найден или пользователь не является участником' })
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req,
  ) {
    return this.messengerService.sendMessage(req.user.id, createMessageDto);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Отметить сообщения как прочитанные' })
  @ApiParam({ name: 'id', description: 'ID чата', type: 'number' })
  @ApiBody({ type: MarkReadDto })
  @ApiOkResponse({
    description: 'Сообщения успешно отмечены как прочитанные',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiForbiddenResponse({ description: 'Доступ запрещен' })
  @ApiNotFoundResponse({ description: 'Чат не найден или пользователь не является участником' })
  async markMessagesAsRead(
    @Param('id', ParseIntPipe) conversationId: number,
    @Body() body: MarkReadDto,
    @Request() req,
  ) {
    await this.messengerService.markMessagesAsRead(
      req.user.id, 
      conversationId, 
      body.messageIds
    );
    return { success: true };
  }
}
