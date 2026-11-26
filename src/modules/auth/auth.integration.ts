import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth.module.js';
import {
    type INestApplication,
    NotFoundException,
    ValidationPipe,
} from '@nestjs/common';
import { createTestDataSource } from '../../../test/integration/helpers/create-test-data-source.js';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from '../../common/filters/all-exceptions.filter.js';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor.js';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { PasswordHasherService } from './password-hasher.service.js';

describe('Auth integration', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot(createTestDataSource().options),
                AuthModule,
            ],
            providers: [
                { provide: APP_FILTER, useClass: AllExceptionsFilter },
                { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
            ],
        });

        const moduleRef = await module.compile();

        app = moduleRef.createNestApplication();

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        await app.init();
    });

    afterAll(async () => {
        await app?.close();
    });

    describe('POST /auth/register', () => {
        it('registers a new user', async () => {
            const email = `user-${randomUUID()}@test.com`;
            const password = 'test-password';

            try {
                const response = await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({ email, password });

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(response.body.data.email).toBe(email);
                expect(response.body.error).toBe(null);
                expect(response.body.data).not.toHaveProperty('password');
                expect(response.body.data).not.toHaveProperty('passwordHash');

                const usersService = app.get(UsersService);
                const savedUser =
                    await usersService.findByEmailWithPassword(email);

                if (savedUser === null) {
                    throw new NotFoundException('User not found');
                }

                expect(response.body.data.id).toBe(savedUser.id);
                expect(response.body.data.createdAt).toBe(
                    savedUser.createdAt.toISOString(),
                );

                const passwordHashService = app.get(PasswordHasherService);

                const result = await passwordHashService.verify(
                    savedUser.passwordHash,
                    password,
                );

                expect(result).toBe(true);
            } finally {
                const usersRepository = app.get(DataSource).getRepository(User);
                await usersRepository.delete({ email });
            }
        });

        it('rejects invalid registration data', async () => {
            const email = 'not-an-email';
            const password = 'short';

            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email, password });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.data).toBeNull();
            expect(response.body.error.code).toBe('BAD_REQUEST');
            expect(response.body.error.details).toEqual(
                expect.arrayContaining([
                    expect.stringMatching(/^email\b/),
                    expect.stringMatching(/^password\b/),
                ]),
            );
        });

        it('rejects registration with an existing email', async () => {
            const email = `user-${randomUUID()}@test.com`;
            const password = 'test-password';

            try {
                const validResponse = await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({ email, password });

                const invalidResponse = await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({ email, password });

                expect(validResponse.status).toBe(201);
                expect(validResponse.body.success).toBe(true);
                expect(invalidResponse.status).toBe(409);
                expect(invalidResponse.body.error.code).toBe('CONFLICT');
                expect(invalidResponse.body.success).toBe(false);
            } finally {
                const usersRepository = app.get(DataSource).getRepository(User);
                await usersRepository.delete({ email });
            }
        });
    });
});
