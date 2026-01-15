import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from '../services/health.service';
import { HealthCheckDto } from '../dto/health-check.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health Check Endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy', type: HealthCheckDto })
  @ApiResponse({ status: 503, description: 'Service is unhealthy', type: HealthCheckDto })
  async getHealth(): Promise<HealthCheckDto> {
    return this.healthService.getHealthStatus();
  }
}
