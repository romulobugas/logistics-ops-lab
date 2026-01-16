import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import pino from 'pino';

async function bootstrap() {
  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      log: (log: any) => ({
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

  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Logistics Ops Lab API')
    .setVersion('1.0.0')
    .setDescription('Logistics Operations Platform - API Service')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

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
