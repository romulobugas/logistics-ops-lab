export declare class HealthCheckDto {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    service: string;
    details?: Record<string, any>;
}
//# sourceMappingURL=health-check.dto.d.ts.map