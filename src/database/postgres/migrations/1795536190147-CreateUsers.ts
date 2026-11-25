import { type MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1795536190147 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE users(
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
				email varchar(254) NOT NULL,
				password_hash text NOT NULL,
				created_at timestamptz NOT NULL DEFAULT now(),
				CONSTRAINT uq_users_email UNIQUE(email)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE users
        `);
    }
}
