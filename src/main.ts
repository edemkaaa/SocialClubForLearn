import 'dotenv/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import validationOptions from './utils/validation-options';
import { AllConfigType } from './config/config.type';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  // Настройка CORS для REST и WebSocket
  app.enableCors({
    origin: '*', // В продакшене настройте конкретные домены
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Настройка WebSocket адаптера
  app.useWebSocketAdapter(new IoAdapter(app));

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(
    // ResolvePromisesInterceptor is used to resolve promises in responses because class-transformer can't do it
    // https://github.com/typestack/class-transformer/issues/549
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('posts')
    .addTag('notifications', 'Операции с уведомлениями')
    .addTag('messenger', 'Операции с мессенджером')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  
  // Добавляем документацию по WebSocket
  const wsDocument = {
    ...document,
    components: {
      ...(document.components || {}),
      schemas: {
        ...(document.components?.schemas || {}),
        WebSocketEvent: {
          type: 'object',
          properties: {
            event: { type: 'string', example: 'newMessage', description: 'Название события' },
            data: { type: 'object', description: 'Данные события' },
          },
        },
        MessageEvent: {
          type: 'object',
          properties: {
            event: { type: 'string', example: 'newMessage', description: 'Событие нового сообщения' },
            data: { 
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                content: { type: 'string', example: 'Привет!' },
                type: { type: 'string', example: 'text' },
                status: { type: 'string', example: 'sent' },
                sender: { type: 'object', properties: { id: { type: 'number' } } }
              } 
            },
          },
        },
        ReadEvent: {
          type: 'object',
          properties: {
            event: { type: 'string', example: 'messagesRead', description: 'Событие прочтения сообщений' },
            data: { 
              type: 'object',
              properties: {
                userId: { type: 'number', example: 1, description: 'ID пользователя, прочитавшего сообщения' },
                conversationId: { type: 'number', example: 1, description: 'ID чата' },
                messageIds: { type: 'array', items: { type: 'number' }, example: [1, 2, 3], description: 'ID прочитанных сообщений' }
              } 
            },
          },
        },
      },
    },
    paths: {
      ...document.paths,
      '/messenger-socket': {
        get: {
          tags: ['messenger'],
          summary: 'WebSocket соединение для мессенджера',
          description: `
## WebSocket API для мессенджера

Подключение: \`ws://localhost:3000/messenger\`

### Авторизация
Для авторизации передайте JWT токен в handshake:
\`\`\`javascript
const socket = io('http://localhost:3000/messenger', {
  auth: { token: 'ваш_jwt_токен' }
});
\`\`\`

### События от сервера:
- \`newMessage\`: новое сообщение в чате
- \`messagesRead\`: сообщения отмечены как прочитанные

### События от клиента:
- \`sendMessage\`: отправить новое сообщение
- \`markAsRead\`: отметить сообщения как прочитанные
          `,
          responses: {
            '200': {
              description: 'WebSocket соединение установлено',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      connected: { type: 'boolean', example: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  
  SwaggerModule.setup('docs', app, wsDocument);

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
