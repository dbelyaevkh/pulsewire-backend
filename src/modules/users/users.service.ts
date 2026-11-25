import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, USERS_EMAIL_UNIQUE } from './entities/user.entity.js';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../../common/utils/db-errors.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async createUser(email: string, passwordHash: string): Promise<User> {
        const user: User = this.usersRepository.create({ email, passwordHash });

        try {
            return await this.usersRepository.save(user);
        } catch (error: unknown) {
            if (isUniqueViolation(error, USERS_EMAIL_UNIQUE)) {
                throw new ConflictException('Email already exists');
            }

            throw error;
        }
    }

    async findByEmailWithPassword(email: string) {
        return this.usersRepository
            .createQueryBuilder('user')
            .addSelect('user.passwordHash')
            .where('user.email = :email', { email })
            .getOne();
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ id });
    }
}
