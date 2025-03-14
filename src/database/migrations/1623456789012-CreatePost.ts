import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePostsTable1623456789012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создание таблицы posts (с дополнительными столбцами)
    await queryRunner.createTable(
      new Table({
        name: 'posts',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment', // желательно указать strategy
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'imageUrl', // столбец для URL изображения
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'someField', // новый столбец (пример)
            type: 'varchar',
            isNullable: true, // пусть будет необязательным
          },
          {
            name: 'userId', // столбец для связи с пользователем (пример)
            type: 'int',
            isNullable: true, // если пользователь может быть не задан
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Добавление начальных данных (пример)
    await queryRunner.query(`
        INSERT INTO posts (title, content, "imageUrl", "createdAt", "updatedAt")
        VALUES 
        ('Первый пост', 'Это содержимое первого поста.', NULL, NOW(), NOW()),
        ('Второй пост', 'Это содержимое второго поста.', NULL, NOW(), NOW());
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаление таблицы posts
    await queryRunner.dropTable('posts');
  }
}
