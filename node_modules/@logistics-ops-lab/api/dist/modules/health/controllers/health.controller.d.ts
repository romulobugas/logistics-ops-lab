import { HealthService } from '../services/health.service';
import { HealthCheckDto } from '../dto/health-check.dto';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(): Promise<HealthCheckDto>;
}
//# sourceMappingURL=health.controller.d.ts.map