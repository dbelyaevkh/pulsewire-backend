import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { PasswordHasherService } from './password-hasher.service.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly passwordHasher: PasswordHasherService,
        private readonly usersService: UsersService,
    ) {}

    async register(dto: CreateUserDto): Promise<UserResponseDto> {
        const password = await this.passwordHasher.hash(dto.password);
        const user: User = await this.usersService.createUser(
            dto.email,
            password,
        );

        return UserResponseDto.from(user);
    }
}
