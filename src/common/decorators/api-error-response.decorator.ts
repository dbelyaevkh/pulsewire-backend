import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export function ApiErrorResponse(status: number, description: string) {
    const detailsSchema = {
        type: 'array',
        items: { type: 'string' },
        description:
            'Additional error details. Validation errors include an array of messages.',
    };
    return ApiResponse({
        status,
        description,
        schema: {
            type: 'object',
            required: ['success', 'data', 'error'],
            properties: {
                success: { type: 'boolean', enum: [false] },
                data: { type: 'object', nullable: true, enum: [null] },
                error: {
                    type: 'object',
                    required: ['code', 'message'],
                    properties: {
                        code: { type: 'string' },
                        message: { type: 'string' },
                        ...(status === HttpStatus.BAD_REQUEST
                            ? { details: detailsSchema }
                            : {}),
                    },
                },
            },
        },
    });
}
