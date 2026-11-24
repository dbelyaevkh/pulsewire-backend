import { parseArgs } from 'node:util';

export function readCli(argv: string[]): Record<string, string> {
    const { values } = parseArgs({
        args: argv,
        options: {
            'app-name': {
                type: 'string',
            },
            host: {
                type: 'string',
            },
            port: {
                type: 'string',
            },
            'postgres-dsn': {
                type: 'string',
            },
        },
        strict: true,
        allowPositionals: false,
    });

    const mapped: Record<string, string | undefined> = {
        APP_NAME: values['app-name'] as string | undefined,
        HOST: values.host as string | undefined,
        PORT: values.port as string | undefined,
        POSTGRES_DSN: values['postgres-dsn'] as string | undefined,
    };

    return Object.fromEntries(
        Object.entries(mapped).filter(([, v]) => v !== undefined),
    ) as Record<string, string>;
}
