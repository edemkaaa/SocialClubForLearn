// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    ConfigModule.forRoot(), // Для работы с .env
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
