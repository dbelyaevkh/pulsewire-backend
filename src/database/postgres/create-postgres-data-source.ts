import { DataSource } from 'typeorm';
import { makePostgresOptions } from './database.options.js';

// Entities
import { User } from '../../modules/users/entities/user.entity.js';

// Migrations
import { CreateUsers1795536190147 } from './migrations/1795536190147-CreateUsers.js';

export function createPostgresDataSource(dsn: string): DataSource {
    return new DataSource({
        ...makePostgresOptions(dsn),
        entities: [User],
        migrations: [CreateUsers1795536190147],
    });
}
