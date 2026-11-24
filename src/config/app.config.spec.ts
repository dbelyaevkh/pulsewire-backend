import { describe, it, expect } from 'vitest';
import { loadConfig } from './app.config.js';
import { AppConfigError } from './errors/app-config.error.js';

const BASE_CONFIG = { APP_NAME: 'Test', HOST: '127.0.0.1', PORT: '3000' };

describe('loadConfig', () => {
    describe('valid config', () => {
        it('parses valid application config', () => {
            const result = loadConfig(BASE_CONFIG, []);

            expect(result).toEqual({
                APP_NAME: 'Test',
                HOST: '127.0.0.1',
                PORT: 3000,
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
            const configWithoutPort = {
                APP_NAME: 'Test',
                HOST: '127.0.0.1',
            };

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
    });
});
