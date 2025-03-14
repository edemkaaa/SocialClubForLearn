import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessenger1741816683338 implements MigrationInterface {
  name = 'CreateMessenger1741816683338';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."chat_messages_type_enum" AS ENUM('text', 'image', 'file', 'voice', 'video', 'location')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chat_messages_status_enum" AS ENUM('sent', 'delivered', 'read')`,
    );
    await queryRunner.query(
      `CREATE TABLE "chat_messages" ("id" SERIAL NOT NULL, "type" "public"."chat_messages_type_enum" NOT NULL DEFAULT 'text', "content" text NOT NULL, "status" "public"."chat_messages_status_enum" NOT NULL DEFAULT 'sent', "isEdited" boolean NOT NULL DEFAULT false, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "conversation_id" integer, "sender_id" integer, CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."conversations_type_enum" AS ENUM('direct', 'group')`,
    );
    await queryRunner.query(
      `CREATE TABLE "conversations" ("id" SERIAL NOT NULL, "type" "public"."conversations_type_enum" NOT NULL DEFAULT 'direct', "name" character varying, "avatar" character varying, "lastMessageId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "conversation_participants" ("conversation_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_fdcd6405d74e797f10fa8360338" PRIMARY KEY ("conversation_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1559e8a16b828f2e836a231280" ON "conversation_participants" ("conversation_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_377d4041a495b81ee1a85ae026" ON "conversation_participants" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_3d623662d4ee1219b23cf61e649" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_9e5fc47ecb06d4d7b84633b1718" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_participants" ADD CONSTRAINT "FK_1559e8a16b828f2e836a2312800" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_participants" ADD CONSTRAINT "FK_377d4041a495b81ee1a85ae026f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversation_participants" DROP CONSTRAINT "FK_377d4041a495b81ee1a85ae026f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_participants" DROP CONSTRAINT "FK_1559e8a16b828f2e836a2312800"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_9e5fc47ecb06d4d7b84633b1718"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_3d623662d4ee1219b23cf61e649"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_377d4041a495b81ee1a85ae026"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1559e8a16b828f2e836a231280"`,
    );
    await queryRunner.query(`DROP TABLE "conversation_participants"`);
    await queryRunner.query(`DROP TABLE "conversations"`);
    await queryRunner.query(`DROP TYPE "public"."conversations_type_enum"`);
    await queryRunner.query(`DROP TABLE "chat_messages"`);
    await queryRunner.query(`DROP TYPE "public"."chat_messages_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."chat_messages_type_enum"`);
  }
}
