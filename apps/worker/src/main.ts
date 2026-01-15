import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { Logger } from 'pino';
import { HealthModule } from './modules/health/health.module';

async function bootstrap() {
  const logger = new Logger({
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

  const app = await NestFactory.create();

  app.useLogger(logger);

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
