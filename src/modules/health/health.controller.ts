import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    TypeOrmHealthIndicator,
    MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly postgres: TypeOrmHealthIndicator,
        private readonly mongoose: MongooseHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.postgres.pingCheck('postgres').withTimeout('1s'),
            () => this.mongoose.pingCheck('mongoose').withTimeout('1s'),
        ]);
    }
}
