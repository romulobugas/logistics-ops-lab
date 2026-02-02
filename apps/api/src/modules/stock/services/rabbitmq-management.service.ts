import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect } from 'amqplib';
import { PrismaService } from '../../../prisma/prisma.service';

type AmqpConnection = any;
type AmqpChannel = any;

export interface QueueMessage {
  messageCount: number;
  consumerCount: number;
}

type ActivityTraceEntry = Awaited<
  ReturnType<PrismaService['activityTrace']['findMany']>
>[number];

@Injectable()
export class RabbitMQManagementService implements OnModuleInit, OnModuleDestroy {
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

    this.connection = (await connect(url)) as AmqpConnection;
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queueName, { durable: true });
  }

  async getQueueStatus(): Promise<QueueMessage> {
    await this.connect();
    if (!this.channel) {
      throw new Error('Failed to connect to RabbitMQ');
    }

    const checkQueue = await this.channel.checkQueue(this.queueName);
    return {
      messageCount: checkQueue.messageCount,
      consumerCount: checkQueue.consumerCount,
    };
  }

  async getPendingActivities(): Promise<any[]> {
    await this.connect();
    if (!this.channel) {
      throw new Error('Failed to connect to RabbitMQ');
    }

    // Obter atividades com status QUEUED que ainda não foram processadas
    const queuedTraces = await this.prisma.activityTrace.findMany({
      where: {
        status: 'QUEUED',
      },
      include: {
        activity: {
          include: {
            sku: true,
            location: true,
            destinationLocation: true,
            assignedUser: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Verificar quais ainda estão pendentes comparando com a fila
    const queueStatus = await this.getQueueStatus();
    
    return queuedTraces.map((trace: ActivityTraceEntry) => ({
      ...trace,
      queueInfo: {
        isStillInQueue: true, // Se tem trace QUEUED, assume que está na fila
        totalMessagesInQueue: queueStatus.messageCount,
      },
    }));
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
