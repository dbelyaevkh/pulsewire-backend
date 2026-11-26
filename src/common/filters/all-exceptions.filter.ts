import {
    ArgumentsHost,
    Catch,
    HttpException,
    HttpStatus,
    Logger,
    type ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';

interface HttpExceptionBody {
    message?: string | string[];
    code?: string;
    error: string;
    statusCode?: number;
}

const isExceptionBody = (v: unknown): v is HttpExceptionBody =>
    typeof v === 'object' && v !== null;

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger: Logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let code = 'INTERNAL_SERVER_ERROR';
        let message = 'Internal server error';
        let details: unknown;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            code = HttpStatus[status] ?? code;

            const body = exception.getResponse();

            if (typeof body === 'string') {
                message = body;
            } else if (isExceptionBody(body)) {
                if (Array.isArray(body.message)) {
                    message = 'Validation failed';
                    details = body.message;
                } else if (body.message) {
                    message = body.message;
                }
            }
        } else {
            this.logger.error(exception);
        }

        response.status(status).json({
            success: false,
            data: null,
            error: { code, message, details },
        });
    }
}
