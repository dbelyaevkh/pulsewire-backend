import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

export function ApiSuccessResponse(status: number, model: Type<unknown>) {
    return applyDecorators(
        ApiExtraModels(model),
        ApiResponse({
            status,
            schema: {
                type: 'object',
                required: ['success', 'data', 'error'],
                properties: {
                    success: { type: 'boolean', enum: [true] },
                    data: { $ref: getSchemaPath(model) },
                    error: { type: 'string', nullable: true, enum: [null] },
                },
            },
        }),
    );
}
