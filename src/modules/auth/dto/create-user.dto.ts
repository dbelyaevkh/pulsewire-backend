import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        format: 'email',
        example: 'user@example.com',
        required: true,
    })
    @IsEmail()
    email!: string;

    @ApiProperty({
        format: 'password',
        minLength: 8,
        maxLength: 52,
        required: true,
    })
    @IsString()
    @MinLength(8)
    @MaxLength(52)
    password!: string;
}
