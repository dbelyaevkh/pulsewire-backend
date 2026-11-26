import {
    ArgumentsHost,
    ConflictException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { describe, it, expect, vi } from 'vitest';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

describe('AllExceptionsFilter', () => {
    it('uses HTTP status code for exceptions with a string body', () => {
        const exception = new HttpException(
            'Invalid input',
            HttpStatus.BAD_REQUEST,
        );

        const response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        const host = {
            switchToHttp: () => ({
                getResponse: () => response,
            }),
        } as unknown as ArgumentsHost;

        const filter = new AllExceptionsFilter();

        filter.catch(exception, host);

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({
                    code: 'BAD_REQUEST',
                    message: 'Invalid input',
                }),
            }),
        );
    });

    it('includes validation messages in error details', () => {
        const exception = new HttpException(
            { message: ['Invalid email', 'Password is too short'] },
            HttpStatus.BAD_REQUEST,
        );

        const response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        const host = {
            switchToHttp: () => ({
                getResponse: () => response,
            }),
        } as unknown as ArgumentsHost;

        const filter = new AllExceptionsFilter();

        filter.catch(exception, host);

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({
                    code: 'BAD_REQUEST',
                    message: 'Validation failed',
                    details: ['Invalid email', 'Password is too short'],
                }),
            }),
        );
    });

    it('returns a generic 500 response for an unexpected error', () => {
        const exception = new Error('Something went wrong');

        const response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        const host = {
            switchToHttp: () => ({
                getResponse: () => response,
            }),
        } as unknown as ArgumentsHost;

        const filter = new AllExceptionsFilter();

        filter.catch(exception, host);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Internal server error',
                }),
            }),
        );
    });

    it('preserves the message from a conflict exception', () => {
        const exception = new ConflictException('Email already exists');

        const response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        const host = {
            switchToHttp: () => ({
                getResponse: () => response,
            }),
        } as unknown as ArgumentsHost;

        const filter = new AllExceptionsFilter();

        filter.catch(exception, host);

        expect(response.status).toHaveBeenCalledWith(409);
        expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({
                    code: 'CONFLICT',
                    message: 'Email already exists',
                }),
            }),
        );
    });

    it('uses INTERNAL_ERROR for an unmapped HTTP status', () => {
        const exception = new HttpException('Something went wrong', 599);

        const response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        const host = {
            switchToHttp: () => ({
                getResponse: () => response,
            }),
        } as unknown as ArgumentsHost;

        const filter = new AllExceptionsFilter();

        filter.catch(exception, host);

        expect(response.status).toHaveBeenCalledWith(599);
        expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Something went wrong',
                }),
            }),
        );
    });

    it('uses the default message when the exception body is null', () => {
        const exception = new HttpException(
            {},
            HttpStatus.INTERNAL_SERVER_ERROR,
        );

        const response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        const host = {
            switchToHttp: () => ({
                getResponse: () => response,
            }),
        } as unknown as ArgumentsHost;

        const filter = new AllExceptionsFilter();

        vi.spyOn(exception, 'getResponse').mockReturnValue(
            null as unknown as object,
        );
        filter.catch(exception, host);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Internal server error',
                }),
            }),
        );
    });

    it('uses the default message when the exception body has no message', () => {
        const exception = new HttpException(
            {},
            HttpStatus.INTERNAL_SERVER_ERROR,
        );

        const response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        const host = {
            switchToHttp: () => ({
                getResponse: () => response,
            }),
        } as unknown as ArgumentsHost;

        const filter = new AllExceptionsFilter();

        filter.catch(exception, host);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Internal server error',
                }),
            }),
        );
    });
});
