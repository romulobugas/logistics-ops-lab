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

    const queueStatus = await this.getQueueStatus();

    const pendingActivities = await this.prisma.stockActivity.findMany({
      where: {
        status: {
          in: ['PENDING', 'IN_PROGRESS'] as any,
        },
      },
      include: {
        sku: true,
        location: true,
        destinationLocation: true,
        assignedUser: true,
        traces: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    type PendingActivity = (typeof pendingActivities)[number];

    return pendingActivities
      .map((activity: PendingActivity) => {
        const { traces, ...activityInfo } = activity;
        const latestTrace = traces[0] as ActivityTraceEntry | undefined;
        const fallbackTrace: ActivityTraceEntry =
          latestTrace ?? {
            id: `pending-${activity.id}`,
            activityId: activity.id,
            status: activity.status,
            source: 'API',
            message: this.describePendingActivity(activity.status, activity.type),
            timestamp: activity.updatedAt,
            userId: activity.assignedUserId ?? null,
          };
        const isQueued = latestTrace?.status === 'QUEUED';

        return {
          ...fallbackTrace,
          activity: activityInfo,
          queueInfo: {
            isStillInQueue: isQueued && queueStatus.messageCount > 0,
            totalMessagesInQueue: queueStatus.messageCount,
            stage: isQueued ? 'RMQ' : 'DB',
          },
        };
      })
      .filter(Boolean);
  }

  private describePendingActivity(status: string, type: string) {
    if (status === 'PENDING') {
      return 'Atividade aguardando operador para assumir a execução.';
    }
    if (status === 'IN_PROGRESS') {
      return 'Atividade em andamento aguardando confirmação para envio à fila.';
    }
    return `Atividade ${status?.toLowerCase() || 'pendente'} (${type}).`;
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
