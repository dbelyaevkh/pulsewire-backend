import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { ServiceUnavailableException } from '@nestjs/common';

@Catch(ServiceUnavailableException)
export class HealthExceptionFilter implements ExceptionFilter {
    catch(exception: ServiceUnavailableException, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();

        const status = exception.getStatus();
        const body = exception.getResponse();

        response.status(status).json(body);
    }
}
