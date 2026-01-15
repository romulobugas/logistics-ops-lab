"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckDto = void 0;
class HealthCheckDto {
    status = 'healthy';
    timestamp = new Date().toISOString();
    service = 'api';
    details;
}
exports.HealthCheckDto = HealthCheckDto;
//# sourceMappingURL=health-check.dto.js.map