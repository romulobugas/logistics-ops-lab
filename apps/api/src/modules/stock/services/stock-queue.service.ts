import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect } from 'amqplib';
import { PrismaService } from '../../../prisma/prisma.service';

type AmqpConnection = any;
type AmqpChannel = any;

@Injectable()
export class StockQueueService implements OnModuleInit, OnModuleDestroy {
  private connection: AmqpConnection | null = null;
  private channel: AmqpChannel | null = null;
  private readonly queueName = 'stock.activities';

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    if (this.connection && this.channel) {
      return;
    }

    const host = process.env.RABBITMQ_HOST || 'localhost';
    const port = process.env.RABBITMQ_PORT || '5672';
    const user = process.env.RABBITMQ_USER || 'guest';
    const pass = process.env.RABBITMQ_PASSWORD || 'guest';
    const vhost = process.env.RABBITMQ_VHOST || '/';
    const encodedVhost = encodeURIComponent(vhost);
    const url = `amqp://${user}:${pass}@${host}:${port}/${encodedVhost}`;

    const connection = (await connect(url)) as AmqpConnection;
    const channel = await connection.createChannel();
    await channel.assertQueue(this.queueName, { durable: true });

    this.connection = connection;
    this.channel = channel;
  }

  async publishActivity(payload: Record<string, unknown>) {
    await this.connect();
    if (!this.channel) {
      return;
    }

    // Criar trace no banco antes de enviar para a fila
    if (payload.activityId) {
      try {
        await this.prisma.activityTrace.create({
          data: {
            activityId: payload.activityId as string,
            status: 'QUEUED',
            source: 'API',
            message: 'Atividade enfileirada no RabbitMQ para processamento.',
            userId: payload.assignedUserId as string | null || null,
          },
        });
      } catch (error) {
        console.error('Failed to create queued trace:', error);
      }
    }

    this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
