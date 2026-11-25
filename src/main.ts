import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/app.config.js';
import { AppConfigError } from './config/errors/app-config.error.js';

async function bootstrap() {
    let app: INestApplication | undefined;

    try {
        app = await NestFactory.create(AppModule, {
            abortOnError: false,
        });

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        const swaggerConfig = new DocumentBuilder()
            .setTitle('Pulsewire API')
            .setDescription('Pulsewire backend API')
            .setVersion('0.0.1')
            .build();

        const documentFactory = () =>
            SwaggerModule.createDocument(app!, swaggerConfig);

        SwaggerModule.setup('swagger', app, documentFactory, {
            jsonDocumentUrl: 'swagger/openapi.json',
            swaggerOptions: { persistAuthorization: true },
        });

        const configService =
            app.get<ConfigService<AppConfig, true>>(ConfigService);

        const host: string = configService.getOrThrow('HOST', {
            infer: true,
        });
        const port: number = configService.getOrThrow('PORT', {
            infer: true,
        });

        await app.listen(port, host);
    } catch (error: unknown) {
        console.error('app.startup_failed');

        if (error instanceof AppConfigError) {
            console.error(`Invalid config: ${error.details}`);
        }

        process.exitCode = 1;

        try {
            await app?.close();
        } catch {
            console.error('app.shutdown_failed');
        }
    }
}

await bootstrap();
