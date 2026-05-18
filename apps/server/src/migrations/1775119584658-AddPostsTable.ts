import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostsTable1775119584658 implements MigrationInterface {
    name = 'AddPostsTable1775119584658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."posts_status_enum" AS ENUM('draft', 'published', 'archived')`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "author_id" character varying NOT NULL, "channel_id" character varying, "title" character varying, "content" text, "status" "public"."posts_status_enum" NOT NULL DEFAULT 'published', "is_pinned" boolean NOT NULL DEFAULT false, "view_count" integer NOT NULL DEFAULT '0', "images" text array DEFAULT '{}', "reactions" jsonb DEFAULT '{}', "mezon_message_id" character varying, CONSTRAINT "UQ_e23e6c9f2b2ed56809cc8ba6601" UNIQUE ("mezon_message_id"), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_312c63be865c81b922e39c2475e" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_312c63be865c81b922e39c2475e"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TYPE "public"."posts_status_enum"`);
    }

}
