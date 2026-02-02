import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect } from 'amqplib';
import { PrismaClient, Prisma } from '@prisma/client';

type AmqpConnection = any;
type AmqpChannel = any;

type ActivityPayload = {
  activityId?: string;
  type?: string;
  skuId?: string;
  lotId?: string | null;
  locationId?: string | null;
  destinationLocationId?: string | null;
  quantity?: number;
  reason?: string;
  reservationId?: string | null;
};

@Injectable()
export class StockActivityConsumerService implements OnModuleInit, OnModuleDestroy {
  private connection: AmqpConnection | null = null;
  private channel: AmqpChannel | null = null;
  private readonly queueName = 'stock.activities';
  private readonly prisma = new PrismaClient();

  async onModuleInit() {
    await this.connect();
    await this.consume();
  }

  private async transferLotQuantity(lotId: string, destinationLocationId: string, quantity: number) {
    const lot = await this.prisma.stockLot.findUnique({ where: { id: lotId } });
    if (!lot) {
      throw new Error('Lote não encontrado para transferência');
    }

    if (lot.quantity < quantity) {
      throw new Error('Saldo insuficiente no lote para transferência');
    }

    await this.prisma.stockLot.update({
      where: { id: lotId },
      data: { quantity: Math.max(0, lot.quantity - quantity) },
    });

    const destinationLot = await this.prisma.stockLot.findFirst({
      where: {
        skuId: lot.skuId,
        locationId: destinationLocationId,
        lotCode: lot.lotCode || undefined,
        expiryDate: lot.expiryDate || undefined,
      },
    });

    if (destinationLot) {
      await this.prisma.stockLot.update({
        where: { id: destinationLot.id },
        data: { quantity: destinationLot.quantity + quantity },
      });
      return;
    }

    await this.prisma.stockLot.create({
      data: {
        skuId: lot.skuId,
        locationId: destinationLocationId,
        lotCode: lot.lotCode,
        expiryDate: lot.expiryDate,
        quantity,
      },
    });
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

  private async consume() {
    if (!this.channel) {
      return;
    }

    await this.channel.consume(
      this.queueName,
      async (msg: { content: Buffer } | null) => {
        if (!msg) {
          return;
        }

        try {
          const payload = JSON.parse(msg.content.toString()) as ActivityPayload;

          const activity = await this.prisma.stockActivity.findUnique({
            where: { id: payload.activityId },
            include: { assignedUser: true },
          });

          await this.prisma.activityTrace.create({
            data: {
              activityId: payload.activityId || '',
              status: 'PROCESSING',
              source: 'WORKER',
              message: 'Atividade recebida para processamento.',
              userId: activity?.assignedUserId,
            },
          });

          await this.processActivity(payload);
          this.channel?.ack(msg);
        } catch (error: any) {
          const payload = JSON.parse(msg.content.toString()) as ActivityPayload;
          await this.prisma.activityTrace.create({
            data: {
              activityId: payload.activityId || '',
              status: 'ERROR',
              source: 'WORKER',
              message: `Falha no processamento: ${error.message}`,
            },
          });

          console.error('Failed to process stock activity', error);
          this.channel?.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  }

  private async processActivity(payload: ActivityPayload) {
    if (!payload.activityId) {
      return;
    }

    const activity = await this.prisma.stockActivity.findUnique({
      where: { id: payload.activityId },
      include: { lot: true, reservation: true, assignedUser: true },
    });

    if (!activity || activity.status === 'FINALIZED') {
      return;
    }

    if (activity.status === 'CANCELLED' as any) {
      await this.prisma.activityTrace.create({
        data: {
          activityId: activity.id,
          status: 'CANCELLED',
          source: 'WORKER',
          message: 'Atividade cancelada durante o processamento.',
          userId: activity.assignedUserId,
        },
      });
      return;
    }

    const balance = await this.prisma.stockBalance.findUnique({
      where: { skuId: activity.skuId },
    });

    const currentQuantity = balance?.quantity ?? 0;
    let newQuantity = currentQuantity;

    switch (activity.type) {
      case 'IN':
        newQuantity = currentQuantity + activity.quantity;
        await this.adjustLotQuantity(activity.lotId, activity.quantity);
        break;
      case 'OUT':
        if (currentQuantity < activity.quantity) {
          throw new Error('Saldo insuficiente para baixa');
        }
        newQuantity = currentQuantity - activity.quantity;
        await this.adjustLotQuantity(activity.lotId, -activity.quantity, activity.reservationId || undefined);
        await this.confirmReservation(activity.reservationId || undefined);
        break;
      case 'TRANSFER':
        if (!activity.lotId || !activity.destinationLocationId) {
          throw new Error('Transferência exige lote e localização de destino');
        }
        await this.transferLotQuantity(activity.lotId, activity.destinationLocationId, activity.quantity);
        break;
      case 'ADJUSTMENT':
        newQuantity = activity.quantity;
        break;
      case 'RESERVE':
        await this.confirmReservation(activity.reservationId || undefined);
        break;
      case 'RELEASE':
        await this.releaseReservation(activity.reservationId || undefined);
        break;
      default:
        break;
    }

    if (activity.type !== 'RESERVE' && activity.type !== 'RELEASE' && activity.type !== 'TRANSFER') {
      await this.prisma.stockBalance.upsert({
        where: { skuId: activity.skuId },
        update: { quantity: newQuantity },
        create: { skuId: activity.skuId, quantity: newQuantity },
      });
    }

    if (activity.type !== 'RESERVE' && activity.type !== 'RELEASE') {
      await this.prisma.stockMovement.create({
        data: {
          skuId: activity.skuId,
          lotId: activity.lotId,
          locationId: activity.locationId,
          destinationLocationId: activity.destinationLocationId,
          type: activity.type,
          quantity: activity.quantity,
          reason: payload.reason || 'Movimentação via fila',
        },
      });
    }

    await this.prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      await prisma.stockActivity.update({
        where: { id: activity.id },
        data: { status: 'FINALIZED', completedAt: new Date() },
      });

      await prisma.activityTrace.create({
        data: {
          activityId: activity.id,
          status: 'FINALIZED',
          source: 'WORKER',
          message: 'Atividade finalizada e estoque atualizado com sucesso.',
          userId: activity.assignedUserId,
        },
      });
    });
  }

  private async adjustLotQuantity(lotId?: string | null, quantityDelta = 0, reservationId?: string) {
    if (!lotId) {
      return;
    }

    const lot = await this.prisma.stockLot.findUnique({ where: { id: lotId } });
    if (!lot) {
      return;
    }

    let reservedQuantity = lot.reservedQuantity;
    if (reservationId && quantityDelta < 0) {
      reservedQuantity = Math.max(0, reservedQuantity + quantityDelta);
    }

    await this.prisma.stockLot.update({
      where: { id: lotId },
      data: {
        quantity: Math.max(0, lot.quantity + quantityDelta),
        reservedQuantity,
      },
    });
  }

  private async confirmReservation(reservationId?: string) {
    if (!reservationId) {
      return;
    }

    await this.prisma.stockReservation.update({
      where: { id: reservationId },
      data: { status: 'CONFIRMED' },
    });
  }

  private async releaseReservation(reservationId?: string) {
    if (!reservationId) {
      return;
    }

    const reservation = await this.prisma.stockReservation.findUnique({ where: { id: reservationId } });
    if (!reservation) {
      return;
    }

    if (reservation.lotId) {
      await this.adjustLotQuantity(reservation.lotId, reservation.quantity, reservation.id);
    }

    await this.prisma.stockReservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
    });
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    await this.prisma.$disconnect();
  }
}
