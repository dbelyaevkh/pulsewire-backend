import { describe, it, expect } from 'vitest';
import { QueryFailedError } from 'typeorm';
import { isUniqueViolation } from './db-errors.js';

const PG_UNIQUE_VIOLATION = '23505';
const CONSTRAINT = 'uq_table_constraint';

function makeQueryError(
    driverError: Partial<{ code: string; constraint: string }>,
) {
    return new QueryFailedError(
        'INSERT INTO ...',
        [],
        Object.assign(new Error('driver error'), driverError),
    );
}

describe('isUniqueViolation', () => {
    it('returns true for QueryFailedError with constraint', () => {
        const error = makeQueryError({
            code: PG_UNIQUE_VIOLATION,
            constraint: CONSTRAINT,
        });

        expect(isUniqueViolation(error, CONSTRAINT)).toBe(true);
    });

    it('returns true for QueryFailedError without constraint', () => {
        const error = makeQueryError({ code: PG_UNIQUE_VIOLATION });

        expect(isUniqueViolation(error)).toBe(true);
    });

    it('returns false with fake code', () => {
        const error = makeQueryError({ code: '337788' });

        expect(isUniqueViolation(error)).toBe(false);
    });

    it('returns false for Error', () => {
        const error = new Error();

        expect(isUniqueViolation(error)).toBe(false);
    });

    it('returns false when a different unique constraint is violated', () => {
        const error = makeQueryError({
            code: PG_UNIQUE_VIOLATION,
            constraint: 'users_pkey',
        });

        expect(isUniqueViolation(error, CONSTRAINT)).toBe(false);
    });
});
