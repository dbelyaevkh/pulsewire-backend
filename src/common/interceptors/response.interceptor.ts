import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPaginated, type ApiResponseDto } from '../dto/api-response.dto.js';
import { Reflector } from '@nestjs/core';
import { SKIP_WRAP_KEY } from '../decorators/skip-response-wrap.decorator.js';

@Injectable()
export class ResponseInterceptor<T = unknown> implements NestInterceptor<
    T,
    T | ApiResponseDto<unknown>
> {
    constructor(private readonly reflector: Reflector) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<T | ApiResponseDto<unknown>> {
        const skipWrap = this.reflector.getAllAndOverride<boolean>(
            SKIP_WRAP_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (skipWrap) {
            return next.handle();
        }

        return next.handle().pipe(
            map((payload): ApiResponseDto<unknown> => {
                if (isPaginated(payload)) {
                    return {
                        success: true,
                        data: payload.data,
                        error: null,
                        meta: payload.meta,
                    };
                }

                return { success: true, data: payload ?? null, error: null };
            }),
        );
    }
}
