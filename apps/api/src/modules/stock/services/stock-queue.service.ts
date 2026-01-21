import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect } from 'amqplib';

type AmqpConnection = any;
type AmqpChannel = any;

@Injectable()
export class StockQueueService implements OnModuleInit, OnModuleDestroy {
  private connection: AmqpConnection | null = null;
  private channel: AmqpChannel | null = null;
  private readonly queueName = 'stock.activities';

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
