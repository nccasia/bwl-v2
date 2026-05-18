import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotification1776052746096 implements MigrationInterface {
    name = 'AddNotification1776052746096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('comment', 'reaction', 'mention', 'follow', 'system')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "recipient_id" character varying NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "actors" jsonb NOT NULL DEFAULT '[]', "actor_count" integer NOT NULL DEFAULT '0', "body" text, "entity_id" character varying, "entity_type" character varying, "is_read" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fef3003baf1a06adbfa002d9f8" ON "notifications" ("recipient_id", "entity_id", "type") `);
        await queryRunner.query(`CREATE INDEX "IDX_0266b39213d39be42b60b6a4a5" ON "notifications" ("recipient_id", "is_read") `);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_5332a4daa46fd3f4e6625dd275d" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_5332a4daa46fd3f4e6625dd275d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0266b39213d39be42b60b6a4a5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fef3003baf1a06adbfa002d9f8"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    }

}
