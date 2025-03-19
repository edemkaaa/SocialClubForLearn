import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { AllConfigType } from '../config/config.type';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../posts/infrastructure/persistence/relational/entities/post.entity';
import { Comment } from '../posts/infrastructure/persistence/relational/entities/comment.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, Comment, UserEntity]),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const username = configService.get('app.elasticsearch.username', {
          infer: true,
        });
        const password = configService.get('app.elasticsearch.password', {
          infer: true,
        });

        const config: Record<string, any> = {
          node: configService.get('app.elasticsearch.node', { infer: true }),
          maxRetries: configService.get('app.elasticsearch.maxRetries', {
            infer: true,
          }),
          requestTimeout: configService.get(
            'app.elasticsearch.requestTimeout',
            { infer: true },
          ),
        };

        if (username && password) {
          config.auth = {
            username,
            password,
          };
        }

        return config;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
