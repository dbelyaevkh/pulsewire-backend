import { QueryFailedError } from 'typeorm';

const PG_UNIQUE_VIOLATION = '23505';

export function isUniqueViolation(
    error: unknown,
    constraint?: string,
): error is QueryFailedError {
    if (!(error instanceof QueryFailedError)) {
        return false;
    }

    const driverError = error.driverError;

    return (
        driverError.code === PG_UNIQUE_VIOLATION &&
        (constraint === undefined || driverError.constraint === constraint)
    );
}
