"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const pino_1 = __importDefault(require("pino"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = (0, pino_1.default)({
        level: process.env.LOG_LEVEL || 'info',
        formatters: {
            log: (log) => ({
                msg: log.msg,
                level: log.level,
                timestamp: log.time,
                service: 'worker',
                pid: log.pid,
                hostname: log.hostname,
                eventId: log.reqId,
            }),
        },
    });
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.init();
    const port = process.env.WORKER_PORT || 3001;
    await app.listen(port);
    logger.info(`Worker application started on port ${port}`, {
        service: 'worker',
        port: Number(port),
        environment: process.env.NODE_ENV || 'development',
    });
}
bootstrap();
//# sourceMappingURL=main.js.map