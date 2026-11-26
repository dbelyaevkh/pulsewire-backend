import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../common/decorators/api-success-response.decorator.js';
import { ApiErrorResponse } from '../../common/decorators/api-error-response.decorator.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiSuccessResponse(HttpStatus.CREATED, UserResponseDto)
    @ApiErrorResponse(HttpStatus.CONFLICT, 'Email already exists')
    @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid registration data')
    register(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
        return this.authService.register(dto);
    }
}
