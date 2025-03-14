import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessengerController } from './controllers/messenger.controller';
import { MessengerService } from './services/messenger.service';
import { MessengerGateway } from './gateways/messenger.gateway';
import { Conversation } from './entities/conversation.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, ChatMessage, UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('auth.secret', { infer: true }),
        signOptions: {
          expiresIn: configService.get('auth.expires', { infer: true }),
        },
      }),
    }),
  ],
  controllers: [MessengerController],
  providers: [MessengerService, MessengerGateway],
  exports: [MessengerService],
})
export class MessengerModule {}
