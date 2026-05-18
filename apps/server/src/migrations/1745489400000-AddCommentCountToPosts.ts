import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentCountToPosts1745489400000 implements MigrationInterface {
  name = 'AddCommentCountToPosts1745489400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "comment_count" integer NOT NULL DEFAULT 0`,
    );

    await queryRunner.query(`
      UPDATE "posts" p
      SET "comment_count" = sub.cnt
      FROM (
        SELECT "post_id", COUNT(*) AS cnt
        FROM "comments"
        WHERE "deleted_at" IS NULL
          AND "parent_id" IS NULL
        GROUP BY "post_id"
      ) sub
      WHERE p.id = sub.post_id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN IF EXISTS "comment_count"`);
  }
}
