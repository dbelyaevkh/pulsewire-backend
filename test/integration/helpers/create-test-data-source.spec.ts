import { describe, it, expect } from 'vitest';
import { createTestDataSource } from './create-test-data-source.js';

const POSTGRES_TEST_DSN =
    'postgresql://pulsewire_test_app:YOUR_PASSWORD@127.0.0.1:15432/invalid_database_name';

describe('createTestDataSource', () => {
    it('rejects Postgres DSN with a database name other than pulsewire_test', () => {
        try {
            vi.stubEnv('POSTGRES_TEST_DSN', POSTGRES_TEST_DSN);

            expect(createTestDataSource).throws(
                'Database should be pulsewire_test',
            );
        } finally {
            vi.unstubAllEnvs();
        }
    });
});
