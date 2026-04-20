import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFollow1776307703712 implements MigrationInterface {
    name = 'AddFollow1776307703712'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "follows" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "follower_id" character varying NOT NULL, "following_id" character varying NOT NULL, CONSTRAINT "UQ_8109e59f691f0444b43420f6987" UNIQUE ("follower_id", "following_id"), CONSTRAINT "PK_8988f607744e16ff79da3b8a627" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c518e3988b9c057920afaf2d8c" ON "follows" ("following_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_54b5dc2739f2dea57900933db6" ON "follows" ("follower_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_54b5dc2739f2dea57900933db6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c518e3988b9c057920afaf2d8c"`);
        await queryRunner.query(`DROP TABLE "follows"`);
    }

}
