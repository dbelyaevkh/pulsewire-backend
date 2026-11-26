import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity.js';

export class UserResponseDto {
    @ApiProperty({ format: 'uuid' })
    id!: string;

    @ApiProperty({ format: 'email', example: 'user@example.com' })
    email!: string;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt!: Date;

    static from(user: User): UserResponseDto {
        return {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
        };
    }
}
