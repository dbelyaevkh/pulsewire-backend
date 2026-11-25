import { config as loadEnv } from 'dotenv';
import { postgresDsnSchema } from '../../../src/config/app.config.js';
import { DataSource } from 'typeorm';
import { createPostgresDataSource } from '../../../src/database/postgres/create-postgres-data-source.js';

export function createTestDataSource(): DataSource {
    loadEnv({ path: '.env.test' });

    const dsn = postgresDsnSchema.parse(process.env.POSTGRES_TEST_DSN);

    const url = new URL(dsn);

    if (url.pathname !== '/pulsewire_test') {
        throw new Error('Database should be pulsewire_test');
    }

    return createPostgresDataSource(dsn);
}
