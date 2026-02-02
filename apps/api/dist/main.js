"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const pino_1 = __importDefault(require("pino"));
async function bootstrap() {
    const logger = (0, pino_1.default)({
        level: process.env.LOG_LEVEL || 'info',
        formatters: {
            log: (log) => ({
                msg: log.msg,
                level: log.level,
                timestamp: log.time,
                service: 'api',
                pid: log.pid,
                hostname: log.hostname,
                requestId: log.reqId,
            }),
        },
    });
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: new common_1.Logger(),
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Logistics Ops Lab API')
        .setVersion('1.0.0')
        .setDescription('Logistics Operations Platform - API Service')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.init();
    const port = process.env.API_PORT || 3001;
    await app.listen(port);
    logger.info(`API application started on port ${port}`, {
        service: 'api',
        port: Number(port),
        environment: process.env.NODE_ENV || 'development',
    });
}
bootstrap();
//# sourceMappingURL=main.js.map