export class HealthCheckDto {
  status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
  timestamp: string = new Date().toISOString();
  service: string = 'worker';
  details?: Record<string, any>;
}
