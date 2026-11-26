import { describe, it, expect, vi } from 'vitest';
import { Reflector } from '@nestjs/core';
import { ResponseInterceptor } from './response.interceptor.js';
import { of, firstValueFrom } from 'rxjs';
import type { ExecutionContext } from '@nestjs/common';
import { randomUUID } from 'crypto';

describe('ResponseInterceptor', () => {
    it('returns the original payload when response wrapping is skipped', async () => {
        const reflector = new Reflector();

        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

        const responseInterceptor = new ResponseInterceptor(reflector);

        const context = {
            getHandler: () => vi.fn(),
            getClass: () => class {},
        } as unknown as ExecutionContext;

        const payload = { status: 'ok' };
        const next = {
            handle: () => of(payload),
        };

        const result = responseInterceptor.intercept(context, next);

        expect(await firstValueFrom(result)).toBe(payload);
    });

    it('wraps a regular payload in a success response', async () => {
        const reflector = new Reflector();

        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

        const responseInterceptor = new ResponseInterceptor(reflector);

        const context = {
            getHandler: () => vi.fn(),
            getClass: () => class {},
        } as unknown as ExecutionContext;

        const payload = { status: 'ok' };
        const next = {
            handle: () => of(payload),
        };

        const result = responseInterceptor.intercept(context, next);

        expect(await firstValueFrom(result)).toEqual({
            success: true,
            data: payload,
            error: null,
        });
    });

    it('preserves meta and data in a paginated response', async () => {
        const reflector = new Reflector();

        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

        const responseInterceptor = new ResponseInterceptor(reflector);

        const context = {
            getHandler: () => vi.fn(),
            getClass: () => class {},
        } as unknown as ExecutionContext;

        const payload = {
            data: [{ id: randomUUID(), name: 'test' }],
            meta: { total: 1 },
        };
        const next = {
            handle: () => of(payload),
        };

        const result = responseInterceptor.intercept(context, next);

        expect(await firstValueFrom(result)).toEqual({
            success: true,
            data: payload.data,
            meta: payload.meta,
            error: null,
        });
    });

    it('uses null data when the handler returns undefined', async () => {
        const reflector = new Reflector();

        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

        const responseInterceptor = new ResponseInterceptor(reflector);

        const context = {
            getHandler: () => vi.fn(),
            getClass: () => class {},
        } as unknown as ExecutionContext;

        const next = {
            handle: () => of(undefined),
        };

        const result = responseInterceptor.intercept(context, next);

        expect(await firstValueFrom(result)).toEqual({
            success: true,
            data: null,
            error: null,
        });
    });
});
