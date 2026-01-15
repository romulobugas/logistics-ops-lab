import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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
        service: 'api',
        pid: log.pid,
        hostname: log.hostname,
        requestId: log.reqId,
      }),
    },
  });

  const app = await NestFactory.create(
    new DocumentBuilder()
      .setTitle('Logistics Ops Lab API')
      .setVersion('1.0.0')
      .setDescription('Logistics Operations Platform - API Service')
      .build(),
  );

  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(logger);

  await app.init();
  
  const port = process.env.API_PORT || 3000;
  await app.listen(port);
  
  logger.info(`API application started on port ${port}`, {
    service: 'api',
    port: Number(port),
    environment: process.env.NODE_ENV || 'development',
  });
}

bootstrap();
