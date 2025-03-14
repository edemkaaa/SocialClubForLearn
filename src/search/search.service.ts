import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PostEntity } from '../posts/infrastructure/persistence/relational/entities/post.entity';
import { Comment } from '../posts/infrastructure/persistence/relational/entities/comment.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);

  // Названия индексов
  private readonly postsIndex = 'posts';
  private readonly commentsIndex = 'comments';
  private readonly usersIndex = 'users';

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    
    @InjectRepository(PostEntity, 'default')
    private readonly postRepository: Repository<PostEntity>,
    
    @InjectRepository(Comment, 'default')
    private readonly commentRepository: Repository<Comment>,
    
    @InjectRepository(UserEntity, 'default')
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Создает индексы и индексирует существующие данные при старте приложения
   */
  async onModuleInit() {
    try {
      // Создаем индексы
      await this.createIndices();
      
      // Индексируем существующие данные
      await this.indexExistingData();
    } catch (error) {
      this.logger.error(`Ошибка инициализации поискового сервиса: ${error.message}`);
    }
  }

  /**
   * Индексирует все существующие данные в базе
   */
  async indexExistingData(): Promise<void> {
    try {
      this.logger.log('Начинаем индексацию существующих данных...');
      
      // Индексируем пользователей
      const users = await this.userRepository.find();
      this.logger.log(`Найдено ${users.length} пользователей для индексации`);
      
      for (const user of users) {
        await this.indexUser(user).catch(error => {
          this.logger.error(`Ошибка индексации пользователя ${user.id}: ${error.message}`);
        });
      }
      
      // Индексируем посты
      const posts = await this.postRepository.find({ relations: ['user'] });
      this.logger.log(`Найдено ${posts.length} постов для индексации`);
      
      for (const post of posts) {
        await this.indexPost(post).catch(error => {
          this.logger.error(`Ошибка индексации поста ${post.id}: ${error.message}`);
        });
      }
      
      // Индексируем комментарии
      const comments = await this.commentRepository.find({ relations: ['post', 'user'] });
      this.logger.log(`Найдено ${comments.length} комментариев для индексации`);
      
      for (const comment of comments) {
        await this.indexComment(comment).catch(error => {
          this.logger.error(`Ошибка индексации комментария ${comment.id}: ${error.message}`);
        });
      }
      
      this.logger.log('Индексация существующих данных завершена');
    } catch (error) {
      this.logger.error(`Ошибка при индексации существующих данных: ${error.message}`);
      throw error;
    }
  }

  /**
   * Индексирует пост в Elasticsearch
   */
  async indexPost(post: PostEntity): Promise<void> {
    try {
      await this.elasticsearchService.index({
        index: this.postsIndex,
        id: String(post.id),
        document: {
          id: post.id,
          title: post.title,
          content: post.content,
          authorId: post.user?.id,
          authorName: `${post.user?.firstName || ''} ${post.user?.lastName || ''}`.trim(),
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        },
      });
      this.logger.log(`Пост с ID ${post.id} проиндексирован`);
    } catch (error) {
      this.logger.error(`Ошибка при индексации поста: ${error.message}`);
      throw error;
    }
  }

  /**
   * Индексирует комментарий в Elasticsearch
   */
  async indexComment(comment: Comment): Promise<void> {
    try {
      await this.elasticsearchService.index({
        index: this.commentsIndex,
        id: String(comment.id),
        document: {
          id: comment.id,
          text: comment.text,
          postId: comment.post?.id,
          authorId: comment.user?.id,
          authorName: comment.authorName,
          createdAt: comment.createdAt,
        },
      });
      this.logger.log(`Комментарий с ID ${comment.id} проиндексирован`);
    } catch (error) {
      this.logger.error(`Ошибка при индексации комментария: ${error.message}`);
      throw error;
    }
  }

  /**
   * Индексирует пользователя в Elasticsearch
   */
  async indexUser(user: UserEntity): Promise<void> {
    try {
      await this.elasticsearchService.index({
        index: this.usersIndex,
        id: String(user.id),
        document: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
      this.logger.log(`Пользователь с ID ${user.id} проиндексирован`);
    } catch (error) {
      this.logger.error(`Ошибка при индексации пользователя: ${error.message}`);
      throw error;
    }
  }

  /**
   * Удаляет пост из индекса
   */
  async removePostFromIndex(postId: number | string): Promise<void> {
    try {
      await this.elasticsearchService.delete({
        index: this.postsIndex,
        id: String(postId),
      });
      this.logger.log(`Пост с ID ${postId} удален из индекса`);
    } catch (error) {
      this.logger.error(`Ошибка при удалении поста из индекса: ${error.message}`);
      throw error;
    }
  }

  /**
   * Удаляет комментарий из индекса
   */
  async removeCommentFromIndex(commentId: number | string): Promise<void> {
    try {
      await this.elasticsearchService.delete({
        index: this.commentsIndex,
        id: String(commentId),
      });
      this.logger.log(`Комментарий с ID ${commentId} удален из индекса`);
    } catch (error) {
      this.logger.error(`Ошибка при удалении комментария из индекса: ${error.message}`);
      throw error;
    }
  }

  /**
   * Удаляет пользователя из индекса
   */
  async removeUserFromIndex(userId: number | string): Promise<void> {
    try {
      await this.elasticsearchService.delete({
        index: this.usersIndex,
        id: String(userId),
      });
      this.logger.log(`Пользователь с ID ${userId} удален из индекса`);
    } catch (error) {
      this.logger.error(`Ошибка при удалении пользователя из индекса: ${error.message}`);
      throw error;
    }
  }

  /**
   * Производит поиск по всем индексам
   */
  async search(text: string, from = 0, size = 10): Promise<any> {
    try {
      const { hits } = await this.elasticsearchService.search({
        index: [this.postsIndex, this.commentsIndex, this.usersIndex],
        from,
        size,
        query: {
          multi_match: {
            query: text,
            fields: ['title^3', 'content^2', 'text^2', 'firstName^1', 'lastName^1'],
            fuzziness: 'AUTO',
          },
        },
        sort: [
          { _score: { order: 'desc' } },
          { createdAt: { order: 'desc' } }
        ],
        highlight: {
          fields: {
            title: {},
            content: {},
            text: {},
            firstName: {},
            lastName: {},
          },
        },
      });

      return {
        total: hits.total,
        hits: hits.hits.map((hit) => ({
          index: hit._index,
          id: hit._id,
          score: hit._score,
          source: hit._source,
          highlight: hit.highlight,
        })),
      };
    } catch (error) {
      this.logger.error(`Ошибка при поиске: ${error.message}`);
      throw error;
    }
  }

  /**
   * Создает индексы, если они не существуют
   */
  async createIndices(): Promise<void> {
    try {
      // Создание индекса для постов
      const postsIndexExists = await this.elasticsearchService.indices.exists({
        index: this.postsIndex,
      });

      if (!postsIndexExists) {
        this.logger.log(`Создание индекса ${this.postsIndex}...`);
        await this.elasticsearchService.indices.create({
          index: this.postsIndex,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  russian: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'russian_stop', 'russian_stemmer'],
                  },
                },
                filter: {
                  russian_stop: { type: 'stop', stopwords: '_russian_' },
                  russian_stemmer: { type: 'stemmer', language: 'russian' },
                },
              },
            },
            mappings: {
              properties: {
                id: { type: 'integer' },
                title: { type: 'text', analyzer: 'russian' },
                content: { type: 'text', analyzer: 'russian' },
                authorId: { type: 'integer' },
                authorName: { type: 'text', analyzer: 'russian' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' },
              },
            },
          },
        } as any);
        this.logger.log(`Индекс ${this.postsIndex} создан`);
      }

      // Создание индекса для комментариев
      const commentsIndexExists = await this.elasticsearchService.indices.exists({
        index: this.commentsIndex,
      });

      if (!commentsIndexExists) {
        this.logger.log(`Создание индекса ${this.commentsIndex}...`);
        await this.elasticsearchService.indices.create({
          index: this.commentsIndex,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  russian: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'russian_stop', 'russian_stemmer'],
                  },
                },
                filter: {
                  russian_stop: { type: 'stop', stopwords: '_russian_' },
                  russian_stemmer: { type: 'stemmer', language: 'russian' },
                },
              },
            },
            mappings: {
              properties: {
                id: { type: 'keyword' },
                text: { type: 'text', analyzer: 'russian' },
                postId: { type: 'integer' },
                authorId: { type: 'integer' },
                authorName: { type: 'text', analyzer: 'russian' },
                createdAt: { type: 'date' },
              },
            },
          },
        } as any);
        this.logger.log(`Индекс ${this.commentsIndex} создан`);
      }

      // Создание индекса для пользователей
      const usersIndexExists = await this.elasticsearchService.indices.exists({
        index: this.usersIndex,
      });

      if (!usersIndexExists) {
        this.logger.log(`Создание индекса ${this.usersIndex}...`);
        await this.elasticsearchService.indices.create({
          index: this.usersIndex,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  russian: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'russian_stop', 'russian_stemmer'],
                  },
                },
                filter: {
                  russian_stop: { type: 'stop', stopwords: '_russian_' },
                  russian_stemmer: { type: 'stemmer', language: 'russian' },
                },
              },
            },
            mappings: {
              properties: {
                id: { type: 'integer' },
                firstName: { type: 'text', analyzer: 'russian' },
                lastName: { type: 'text', analyzer: 'russian' },
                email: { type: 'keyword' },
                createdAt: { type: 'date' },
              },
            },
          },
        } as any);
        this.logger.log(`Индекс ${this.usersIndex} создан`);
      }
    } catch (error) {
      this.logger.error(`Ошибка при создании индексов: ${error.message}`);
      throw error;
    }
  }
} 