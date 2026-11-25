import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { createTestDataSource } from '../../../test/integration/helpers/create-test-data-source.js';
import { ConflictException } from '@nestjs/common';

const TEST_USER = {
    email: 'user@test.com',
    passwordHash: 'password-hash',
};

describe('UsersService Integration tests', () => {
    let dataSource: DataSource;
    let usersRepository: Repository<User>;
    let usersService: UsersService;
    let email: string;

    beforeAll(async () => {
        dataSource = createTestDataSource();

        await dataSource.initialize();
    });

    beforeEach(() => {
        usersRepository = dataSource.getRepository(User);
        usersService = new UsersService(usersRepository);
        email = `user-${randomUUID()}@test.com`;
    });

    afterAll(async () => {
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy();
        }
    });

    it('creates new User', async () => {
        try {
            const user: User = await usersService.createUser(
                email,
                TEST_USER.passwordHash,
            );

            expect(z.uuid().safeParse(user.id).success).toBe(true);

            const savedUser: User | null = await usersRepository.findOneBy({
                id: user.id,
            });

            expect(savedUser).toMatchObject({
                id: user.id,
                email,
                createdAt: user.createdAt,
            });
        } finally {
            await usersRepository.delete({ email });
        }
    });

    it('rejects user creation with existing email', async () => {
        try {
            await usersService.createUser(email, TEST_USER.passwordHash);

            const act = async () =>
                await usersService.createUser(email, TEST_USER.passwordHash);

            await expect(act()).rejects.toThrow(ConflictException);
        } finally {
            await usersRepository.delete({ email });
        }
    });

    it('finds a user by id without returns the password hash', async () => {
        try {
            const user: User = await usersService.createUser(
                email,
                TEST_USER.passwordHash,
            );

            const savedUser: User | null = await usersService.findById(user.id);

            expect(savedUser).not.toBeNull();
            expect(savedUser?.passwordHash).toBeUndefined();
            expect(savedUser).toMatchObject({ id: user.id, email });
        } finally {
            await usersRepository.delete({ email });
        }
    });

    it('finds a user by email and returning the password hash', async () => {
        try {
            const user: User = await usersService.createUser(
                email,
                TEST_USER.passwordHash,
            );

            const savedUser: User | null =
                await usersService.findByEmailWithPassword(email);

            expect(savedUser).not.toBeNull();
            expect(savedUser).toMatchObject({
                id: user.id,
                email,
                passwordHash: TEST_USER.passwordHash,
            });
        } finally {
            await usersRepository.delete({ email });
        }
    });

    it('returns null when no user matches the ID', async () => {
        const userId = randomUUID();

        const user: User | null = await usersService.findById(userId);

        expect(user).toBeNull();
    });

    it('returns null when no user matches the email', async () => {
        const user: User | null =
            await usersService.findByEmailWithPassword(email);

        expect(user).toBeNull();
    });

    it('rethrows an unexpected error during user creation', async () => {
        const error = new Error('Database unavailable');
        const user = new User();

        const repository = {
            create: vi.fn().mockReturnValue(user),
            save: vi.fn().mockRejectedValue(error),
        };

        const service = new UsersService(
            repository as unknown as Repository<User>,
        );

        await expect(
            service.createUser(email, TEST_USER.passwordHash),
        ).rejects.toBe(error);
    });
});
