export class HealthCheckDto {
  status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
  timestamp: string = new Date().toISOString();
  service: string = 'api';
  details?: Record<string, any>;
}
