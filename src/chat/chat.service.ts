import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Получить ответ от чата
 *     description: Отправляет сообщение и получает ответ от ассистента.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Привет, как дела?"
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   example: "Привет! У меня все хорошо."
 *       500:
 *         description: Ошибка сервера
 */

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createUserMessage(dto: CreateMessageDto): Promise<string> {
    try {
      // Сохраняем сообщение пользователя
      const userMessage = new Message();
      userMessage.role = 'user';
      userMessage.content = dto.content;
      await this.messageRepository.save(userMessage);

      // Отправляем запрос в OpenRouter API
      const apiKey = process.env.OPENROUTER_API_KEY;
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct:free',
          messages: [{ role: 'user', content: dto.content }],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Приведение типа для response.data
      const responseData = response.data as {
        choices: { message: { content: string } }[];
      };

      // Безопасно извлекаем ответ от OpenRouter
      const assistantReply =
        responseData &&
        responseData.choices &&
        responseData.choices[0]?.message?.content
          ? responseData.choices[0].message.content
          : 'Извините, не удалось получить ответ от сервера.';

      // Сохраняем ответ ассистента
      const botMessage = new Message();
      botMessage.role = 'assistant';
      botMessage.content = assistantReply;
      await this.messageRepository.save(botMessage);

      return assistantReply;
    } catch (error) {
      console.error('OpenRouter API Error:', error);

      const errorMessage = 'Извините, произошла ошибка. Попробуйте позже.';
      const errorBotMessage = new Message();
      errorBotMessage.role = 'assistant';
      errorBotMessage.content = errorMessage;

      await this.messageRepository.save(errorBotMessage);

      return errorMessage;
    }
  }

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  // Пример метода для получения ника пользователя по ID
  async getUsernameById(userId: string): Promise<string> {
    // Здесь должна быть логика для получения ника пользователя из базы данных или другого источника
    // Например, можно использовать UserService для получения информации о пользователе
    const user = await this.findUserById(userId); // Предположим, что у вас есть метод для поиска пользователя
    return user.firstname; // Возвращаем ник пользователя
  }

  // Пример метода для поиска пользователя
  private async findUserById(userId: string) {
    // Логика для поиска пользователя в базе данных
    return { firstname: 'ПримерНика' }; // Замените на реальную логику
  }
}
