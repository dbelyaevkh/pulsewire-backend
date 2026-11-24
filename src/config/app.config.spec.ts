import { describe, it, expect } from 'vitest';
import { loadConfig } from './app.config.js';
import { AppConfigError } from './errors/app-config.error.js';

const BASE_CONFIG = {
    APP_NAME: 'Test',
    HOST: '127.0.0.1',
    PORT: '3000',
    POSTGRES_DSN: 'postgresql://user:password@localhost:5432/pulsewire',
    MONGO_DSN:
        'mongodb://user:password@localhost:27017/pulsewire?authSource=admin',
};

describe('loadConfig', () => {
    describe('valid config', () => {
        it('parses valid application config', () => {
            const result = loadConfig(BASE_CONFIG, []);

            expect(result).toEqual({
                APP_NAME: 'Test',
                HOST: '127.0.0.1',
                PORT: 3000,
                POSTGRES_DSN:
                    'postgresql://user:password@localhost:5432/pulsewire',
                MONGO_DSN:
                    'mongodb://user:password@localhost:27017/pulsewire?authSource=admin',
            });

            expect(typeof result.PORT).toBe('number');
        });
    });

    describe('HOST', () => {
        it('rejects invalid HOST', () => {
            const act = () =>
                loadConfig({ ...BASE_CONFIG, HOST: 'not a host' }, []);

            expect(act).toThrow(AppConfigError);
        });
    });

    describe('PORT', () => {
        it('uses 3000 when PORT and --port are absent', () => {
            const configWithoutPort: Partial<typeof BASE_CONFIG> = {
                ...BASE_CONFIG,
            };

            delete configWithoutPort.PORT;

            const result = loadConfig(configWithoutPort, []);

            expect(result.PORT).toBe(3000);
        });

        it.each([
            ['1', 1],
            ['65535', 65535],
        ])('accepts PORT %s and returns %d', (input, expected) => {
            const result = loadConfig({ ...BASE_CONFIG, PORT: input }, []);

            expect(result.PORT).toBe(expected);
            expect(typeof result.PORT).toBe('number');
        });

        it.each(['0', '65536', '3000.5', '0x10', '1e3'])(
            'rejects invalid PORT=%s',
            (port) => {
                const act = () =>
                    loadConfig({ ...BASE_CONFIG, PORT: port }, []);

                expect(act).toThrow(AppConfigError);
            },
        );
    });

    describe('CLI priority', () => {
        it('overrides environment port with --port', () => {
            const result = loadConfig(BASE_CONFIG, ['--port', '4000']);

            expect(result.PORT).toBe(4000);
            expect(result.HOST).toBe('127.0.0.1');
        });

        it('overrides environment host with --host', () => {
            const result = loadConfig(BASE_CONFIG, ['--host', 'localhost']);

            expect(result.PORT).toBe(3000);
            expect(result.HOST).toBe('localhost');
        });

        it('rejects invalid CLI port even when environment port is valid', () => {
            const act = () => loadConfig(BASE_CONFIG, ['--port', 'abc']);

            expect(act).toThrow(AppConfigError);
        });

        it('overrides PostgreSQL DSN with --postgres-dsn', () => {
            const result = loadConfig(BASE_CONFIG, [
                '--postgres-dsn',
                'postgres://user:password@localhost:5432/pulsewire',
            ]);

            expect(result.POSTGRES_DSN).toBe(
                'postgres://user:password@localhost:5432/pulsewire',
            );
        });

        it('overrides MongoDB DSN with --mongo-dsn', () => {
            const result = loadConfig(BASE_CONFIG, [
                '--mongo-dsn',
                'mongodb://user:password@localhost:27017/pulsewire-cli?authSource=admin',
            ]);

            expect(result.MONGO_DSN).toBe(
                'mongodb://user:password@localhost:27017/pulsewire-cli?authSource=admin',
            );
        });
    });

    describe('PostgreSQL DSN', () => {
        it.each([
            'postgres://user:password@localhost:5432/pulsewire',
            'postgresql://user:password@localhost:5432/pulsewire',
        ])('accepts PostgreSQL DSN', (dsn) => {
            const result = loadConfig(
                { ...BASE_CONFIG, POSTGRES_DSN: dsn },
                [],
            );

            expect(result.POSTGRES_DSN).toBe(dsn);
        });

        it('rejects config without POSTGRES_DSN', () => {
            const config: Partial<typeof BASE_CONFIG> = { ...BASE_CONFIG };

            delete config.POSTGRES_DSN;

            const act = () => loadConfig(config, []);

            expect(act).toThrow(AppConfigError);
        });

        it.each([
            'https://localhost/pulsewire',
            'mysql://localhost/pulsewire',
            'not-a-url',
            'postgresql:foo',
            'postgresql://',
            'postgresql://localhost',
            'postgres:foo',
            'postgres://',
            'postgres://localhost',
        ])('rejects invalid PostgreSQL DSN', (dsn) => {
            const act = () =>
                loadConfig({ ...BASE_CONFIG, POSTGRES_DSN: dsn }, []);

            expect(act).toThrow(AppConfigError);
        });
    });

    describe('MongoDB DSN', () => {
        it.each([
            'mongodb://localhost:27017/pulsewire',
            'mongodb://user:password@localhost:27017/pulsewire',
            'mongodb://user:password@localhost:27017/pulsewire?authSource=admin',
            'mongodb+srv://user:password@cluster.example.com/pulsewire',
        ])('accepts MongoDB DSN: %s', (dsn) => {
            const result = loadConfig({ ...BASE_CONFIG, MONGO_DSN: dsn }, []);

            expect(result.MONGO_DSN).toBe(dsn);
        });

        it('rejects config without MONGO_DSN', () => {
            const config: Partial<typeof BASE_CONFIG> = { ...BASE_CONFIG };

            delete config.MONGO_DSN;

            const act = () => loadConfig(config, []);

            expect(act).toThrow(AppConfigError);
        });

        it.each([
            'https://localhost/pulsewire',
            'mysql://localhost/pulsewire',
            'postgresql://localhost/pulsewire',
            'foomongodb://localhost/pulsewire',
            'not-a-url',
            'mongodb:foo',
            'mongodb://',
            'mongodb://localhost',
            'mongodb+srv:foo',
            'mongodb+srv://',
            'mongodb+srv://localhost',
        ])('rejects invalid MongoDB DSN: %s', (dsn) => {
            const act = () =>
                loadConfig({ ...BASE_CONFIG, MONGO_DSN: dsn }, []);

            expect(act).toThrow(AppConfigError);
        });
    });
});
