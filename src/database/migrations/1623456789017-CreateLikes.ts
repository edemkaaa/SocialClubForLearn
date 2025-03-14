import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateLikesTable1623456789017 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Создание таблицы likes
        await queryRunner.createTable(
            new Table({
                name: 'likes',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                    },
                    {
                        name: 'postId',
                        type: 'int',
                    },
                    {
                        name: 'userId',
                        type: 'int',
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
        );

        // Добавление внешних ключей
        await queryRunner.createForeignKey('likes', new TableForeignKey({
            columnNames: ['postId'],
            referencedTableName: 'posts',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
        }));

        await queryRunner.createForeignKey('likes', new TableForeignKey({
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('likes');
        if (table) {
            const foreignKeyPost = table.foreignKeys.find(fk => fk.columnNames.includes('postId'));
            const foreignKeyUser = table.foreignKeys.find(fk => fk.columnNames.includes('userId'));
            if (foreignKeyPost) {
                await queryRunner.dropForeignKey('likes', foreignKeyPost);
            }
            if (foreignKeyUser) {
                await queryRunner.dropForeignKey('likes', foreignKeyUser);
            }
        }
        await queryRunner.dropTable('likes');
    }
}
