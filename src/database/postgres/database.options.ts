import type { DataSourceOptions } from 'typeorm';

export function makePostgresOptions(dsn: string): DataSourceOptions {
    return {
        type: 'postgres',
        url: dsn,
        synchronize: false,
        ssl: false,
        migrationsRun: false,
        dropSchema: false,
        poolSize: 10,
        logging: false,
        connectTimeoutMS: 3000,
        invalidWhereValuesBehavior: {
            null: 'throw',
            undefined: 'throw',
        },
    };
}
