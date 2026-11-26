export interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}

export interface ApiResponseDto<T> {
    success: boolean;
    data: T | null;
    error: ApiError | null;
    meta?: Record<string, unknown> | null;
}

export interface Paginated<D = unknown> {
    data: D;
    meta?: Record<string, unknown>;
}

export const isPaginated = (v: unknown): v is Paginated =>
    typeof v === 'object' && v !== null && 'data' in v && 'meta' in v;
