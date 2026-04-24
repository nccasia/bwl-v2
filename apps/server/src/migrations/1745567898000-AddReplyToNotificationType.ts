import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReplyToNotificationType1745567898000 implements MigrationInterface {
  name = 'AddReplyToNotificationType1745567898000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'reply'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing enum values directly.
    // To roll back, recreate the enum without 'reply'.
    await queryRunner.query(`
      CREATE TYPE "notifications_type_enum_new" AS ENUM ('comment', 'reaction', 'follow');
      ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "notifications_type_enum_new" USING "type"::text::"notifications_type_enum_new";
      DROP TYPE "notifications_type_enum";
      ALTER TYPE "notifications_type_enum_new" RENAME TO "notifications_type_enum";
    `);
  }
}
