import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';

import { postgresDsnSchema } from '../../config/app.config.js';
import { makePostgresOptions } from './database.options.js';

loadEnv({ path: '.env' });

const dsn = postgresDsnSchema.parse(process.env.POSTGRES_DSN);

export const dataSource = new DataSource({
    ...makePostgresOptions(dsn),
    entities: [],
    migrations: [],
});
