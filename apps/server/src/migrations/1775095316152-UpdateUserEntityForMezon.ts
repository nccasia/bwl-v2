import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserEntityForMezon1775095316152 implements MigrationInterface {
    name = 'UpdateUserEntityForMezon1775095316152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "mezon_user_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_93fed282a4b789488e6a76ff5d4" UNIQUE ("mezon_user_id")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "display_name" character varying`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" TYPE character varying USING "id"::character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" TYPE uuid USING "id"::uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "display_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_93fed282a4b789488e6a76ff5d4"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mezon_user_id"`);
    }

}
