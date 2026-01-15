import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from '../services/health.service';
import { HealthCheckDto } from '../dto/health-check.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get health status' })
  @ApiResponse({ status: 200, type: HealthCheckDto })
  async getHealth(): Promise<HealthCheckDto> {
    return this.healthService.getHealthStatus();
  }
}
