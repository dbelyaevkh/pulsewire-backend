import { z } from 'zod';
import { readCli } from '../utils/cli/read.cli.js';
import { AppConfigError } from './errors/app-config.error.js';

const portSchema = z
    .string()
    .regex(/^\d+$/, 'PORT must contain only decimal digits')
    .pipe(z.coerce.number<string>().int().min(1).max(65535))
    .default(3000);

export const postgresDsnSchema = z
    .url({
        protocol: /^postgres(?:ql)?$/,
    })
    .superRefine((dsn, ctx) => {
        if (!URL.canParse(dsn)) {
            return;
        }

        const url = new URL(dsn);

        if (!url.hostname) {
            ctx.addIssue({
                code: 'custom',
                message: 'POSTGRES_DSN must contain a hostname',
            });
        }

        if (url.pathname.length <= 1) {
            ctx.addIssue({
                code: 'custom',
                message: 'POSTGRES_DSN must contain a database name',
            });
        }
    });

const envSchema = z.object({
    APP_NAME: z.string(),
    HOST: z.hostname(),
    PORT: portSchema,
    POSTGRES_DSN: postgresDsnSchema,
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(
    config: Record<string, unknown>,
    argv: string[] = process.argv.slice(2),
): AppConfig {
    const result = envSchema.safeParse({ ...config, ...readCli(argv) });

    if (!result.success) {
        const details = result.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join('; ');
        throw new AppConfigError(details, 'app.startup_failed');
    }

    return result.data;
}
