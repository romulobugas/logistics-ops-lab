import { Controller, Get } from '@nestjs/common';
import { HealthService } from './services/health.service';
import { HealthCheckDto } from './dto/health-check.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(): Promise<HealthCheckDto> {
    return this.healthService.getHealthStatus();
  }
}
