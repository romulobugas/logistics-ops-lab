import { Injectable } from '@nestjs/common';
import { HealthCheckDto } from '../dto/health-check.dto';

@Injectable()
export class HealthService {
  async getHealthStatus(): Promise<HealthCheckDto> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'api',
      details: {
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    };
  }
}
