import { Controller, Get, UseFilters } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    TypeOrmHealthIndicator,
    MongooseHealthIndicator,
} from '@nestjs/terminus';
import { SkipResponseWrap } from '../../common/decorators/skip-response-wrap.decorator.js';
import { HealthExceptionFilter } from './filters/health-exception.filter.js';

@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly postgres: TypeOrmHealthIndicator,
        private readonly mongoose: MongooseHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    @SkipResponseWrap
    @UseFilters(HealthExceptionFilter)
    check() {
        return this.health.check([
            () => this.postgres.pingCheck('postgres').withTimeout('1s'),
            () => this.mongoose.pingCheck('mongoose').withTimeout('1s'),
        ]);
    }
}
