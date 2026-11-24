import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { AppConfig } from '../config/app.config.js';
import { makePostgresOptions } from './postgres/database.options.js';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (
                configService: ConfigService<AppConfig, true>,
            ): TypeOrmModuleOptions => ({
                ...makePostgresOptions(
                    configService.getOrThrow('POSTGRES_DSN', { infer: true }),
                ),
                autoLoadEntities: true,
                retryAttempts: 3,
                retryDelay: 1000,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {}
