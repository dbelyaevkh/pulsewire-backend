import { config as loadEnv } from 'dotenv';
import { createPostgresDataSource } from './create-postgres-data-source.js';

import { postgresDsnSchema } from '../../config/app.config.js';

loadEnv({ path: '.env' });

const dsn = postgresDsnSchema.parse(process.env.POSTGRES_DSN);

export const dataSource = createPostgresDataSource(dsn);
