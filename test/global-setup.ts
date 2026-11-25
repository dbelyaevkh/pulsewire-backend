import { createTestDataSource } from './integration/helpers/create-test-data-source.js';

export default async function setup() {
    const dataSource = createTestDataSource();
    await dataSource.initialize();

    try {
        await dataSource.runMigrations();
    } finally {
        await dataSource.destroy();
    }
}
