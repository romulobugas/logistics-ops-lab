import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { StockRepository } from '../repositories/stock.repository';
import { CreateSkuDto } from '../dto/create-sku.dto';
import { StockMovementDto } from '../dto/stock-movement.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateStockLocationDto } from '../dto/create-stock-location.dto';
import { UpdateStockLocationDto } from '../dto/update-stock-location.dto';
import { CreateStockLotDto } from '../dto/create-stock-lot.dto';
import { UpdateStockLotDto } from '../dto/update-stock-lot.dto';
import { CreateStockReservationDto } from '../dto/create-stock-reservation.dto';
import { UpdateStockReservationDto } from '../dto/update-stock-reservation.dto';
import { CreateStockActivityDto, UpdateStockActivityDto, AssignStockActivityDto, CompleteStockActivityDto, CancelStockActivityDto } from '../dto/index';
import { CreateActiveOperatorDto } from '../dto/create-active-operator.dto';
import { UpdateActiveOperatorDto } from '../dto/update-active-operator.dto';
import { StockQueueService } from './stock-queue.service';

@Injectable()
export class StockService {
  constructor(
    private readonly stockRepository: StockRepository,
    private readonly prisma: PrismaService,
    private readonly stockQueue: StockQueueService,
  ) {}

  async createSku(createSkuDto: CreateSkuDto) {
    // Check if SKU code already exists
    const existingSku = await this.stockRepository.findSkuByCode(createSkuDto.ean || '');
    if (existingSku) {
      throw new ConflictException(`SKU with EAN '${createSkuDto.ean}' already exists`);
    }

    // Create SKU
    const sku = await this.stockRepository.createSku(createSkuDto);

    // Initialize stock balance with 0 quantity
    await this.stockRepository.createOrUpdateStockBalance(sku.id, 0);

    return sku;
  }

  async getSkuByCode(code: string) {
    const sku = await this.stockRepository.findSkuByCode(code);
    if (!sku) {
      throw new NotFoundException(`SKU with code '${code}' not found`);
    }
    return sku;
  }

  async getStockBalance(skuCode: string) {
    const sku = await this.getSkuByCode(skuCode);
    const balance = await this.stockRepository.getStockBalance(sku.id);
    
    if (!balance) {
      throw new NotFoundException(`Stock balance for SKU '${skuCode}' not found`);
    }

    return {
      skuCode: sku.ean || 'N/A',
      description: [sku.brand, sku.color, sku.size].filter(Boolean).join(' ') || 'N/A',
      unit: sku.unitId,
      quantity: balance.quantity,
      updatedAt: balance.updatedAt,
    };
  }

  async listStockBalances() {
    return this.prisma.stockBalance.findMany({
      include: {
        sku: {
          include: {
            product: true,
            unit: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async processStockMovement(stockMovementDto: StockMovementDto) {
    // Find SKU
    const sku = await this.getSkuByCode(stockMovementDto.skuCode);
    
    // Get current balance
    const currentBalance = await this.stockRepository.getStockBalance(sku.id);
    if (!currentBalance) {
      throw new NotFoundException(`Stock balance for SKU '${stockMovementDto.skuCode}' not found`);
    }

    // Calculate new balance
    let newBalance: number;
    if (stockMovementDto.type === 'IN') {
      newBalance = currentBalance.quantity + stockMovementDto.quantity;
    } else if (stockMovementDto.type === 'OUT') {
      if (currentBalance.quantity < stockMovementDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Current balance: ${currentBalance.quantity}, requested: ${stockMovementDto.quantity}`
        );
      }
      newBalance = currentBalance.quantity - stockMovementDto.quantity;
    } else if (stockMovementDto.type === 'ADJUSTMENT') {
      newBalance = stockMovementDto.quantity; // Set absolute balance
    } else if (stockMovementDto.type === 'TRANSFER') {
      if (currentBalance.quantity < stockMovementDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Current balance: ${currentBalance.quantity}, requested: ${stockMovementDto.quantity}`
        );
      }
      newBalance = currentBalance.quantity;
    } else {
      throw new BadRequestException(`Invalid movement type: ${stockMovementDto.type}`);
    }

    // Update stock balance
    await this.stockRepository.createOrUpdateStockBalance(sku.id, newBalance);

    // Record movement
    await this.stockRepository.createStockMovement({
      skuId: sku.id,
      lotId: stockMovementDto.lotId,
      locationId: stockMovementDto.locationId,
      destinationLocationId: stockMovementDto.destinationLocationId,
      type: stockMovementDto.type,
      quantity: stockMovementDto.quantity,
      reason: stockMovementDto.reason,
    });

    return {
      skuCode: sku.ean || 'N/A',
      type: stockMovementDto.type,
      quantity: stockMovementDto.quantity,
      previousBalance: currentBalance.quantity,
      newBalance,
      reason: stockMovementDto.reason,
    };
  }

  async getAvailableLocations(skuId?: string) {
    const locations = await this.prisma.stockLocation.findMany({
      orderBy: [
        { deposit: 'asc' },
        { street: 'asc' },
        { block: 'asc' },
        { level: 'asc' },
        { apartment: 'asc' },
      ],
    });

    if (!skuId) {
      return locations;
    }

    // Filter locations that have active activities for this SKU
    const activeActivities = await this.prisma.stockActivity.findMany({
      where: {
        skuId,
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
      },
      select: {
        locationId: true,
        destinationLocationId: true,
      },
    });

    const blockedLocationIds = new Set<string>();
    activeActivities.forEach(activity => {
      if (activity.locationId) blockedLocationIds.add(activity.locationId);
      if (activity.destinationLocationId) blockedLocationIds.add(activity.destinationLocationId);
    });

    return locations.filter(location => !blockedLocationIds.has(location.id));
  }

  async getAvailableLots(skuId: string, locationId?: string) {
    const lots = await this.prisma.stockLot.findMany({
      where: {
        skuId,
        ...(locationId && { locationId }),
      },
      include: {
        location: true,
        sku: true,
      },
      orderBy: [
        { expiryDate: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // Calculate available quantity for each lot
    const lotsWithAvailability = await Promise.all(
      lots.map(async (lot) => {
        const available = await this.getAvailableStock(skuId, lot.locationId);
        return {
          ...lot,
          availableQuantity: Math.min(lot.quantity, available),
        };
      })
    );

    return lotsWithAvailability.filter(lot => lot.availableQuantity > 0);
  }

  async getAvailableStock(skuId: string, locationId?: string): Promise<number> {
    // Get current balance
    const balance = await this.prisma.stockBalance.findFirst({
      where: { skuId },
    });

    const currentBalance = balance?.quantity || 0;

    // Calculate reserved quantity from active activities
    const activeActivities = await this.prisma.stockActivity.findMany({
      where: {
        skuId,
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
        ...(locationId && {
          OR: [
            { locationId },
            { destinationLocationId: locationId },
          ],
        }),
      },
    });

    const reservedQuantity = activeActivities.reduce((total, activity) => {
      if (activity.type === 'OUT' || activity.type === 'TRANSFER') {
        return total + activity.quantity;
      }
      return total;
    }, 0);

    return Math.max(0, currentBalance - reservedQuantity);
  }

  async requestStockMovement(stockMovementDto: StockMovementDto) {
    const sku = await this.getSkuByCode(stockMovementDto.skuCode);
    const assignedUserId = await this.pickActiveOperator();

    if (stockMovementDto.type === 'TRANSFER') {
      if (!stockMovementDto.lotId || !stockMovementDto.destinationLocationId) {
        throw new BadRequestException('Transferência exige lote e localização de destino');
      }
    }

    const activity = await this.prisma.$transaction(async (prisma) => {
      console.log('Creating activity via requestStockMovement:', {
        type: stockMovementDto.type,
        skuId: sku.id,
        quantity: stockMovementDto.quantity
      });

      const createdActivity = await prisma.stockActivity.create({
        data: {
          type: stockMovementDto.type as any,
          skuId: sku.id,
          lotId: stockMovementDto.lotId,
          locationId: stockMovementDto.locationId,
          destinationLocationId: stockMovementDto.destinationLocationId,
          quantity: stockMovementDto.quantity,
          assignedUserId,
        },
      });

      console.log('Activity created via requestStockMovement:', createdActivity.id);

      const trace = await prisma.activityTrace.create({
        data: {
          activityId: createdActivity.id,
          status: 'CREATED',
          source: 'API',
          message: 'Atividade criada via movimentação de estoque.',
          userId: null, // Não temos usuário autenticado neste endpoint
        },
      });

      console.log('Trace CREATED created via requestStockMovement:', trace.id);

      return createdActivity;
    });

    return activity;
  }

  async createLocation(dto: CreateStockLocationDto) {
    return this.prisma.stockLocation.create({ data: dto });
  }

  async listLocations() {
    return this.prisma.stockLocation.findMany({
      orderBy: [
        { deposit: 'asc' },
        { street: 'asc' },
        { block: 'asc' },
        { level: 'asc' },
        { apartment: 'asc' },
      ],
    });
  }

  async getLocation(id: string) {
    const location = await this.prisma.stockLocation.findUnique({ where: { id } });
    if (!location) {
      throw new NotFoundException('Localização não encontrada');
    }
    return location;
  }

  async updateLocation(id: string, dto: UpdateStockLocationDto) {
    return this.prisma.stockLocation.update({ where: { id }, data: dto });
  }

  async removeLocation(id: string) {
    return this.prisma.stockLocation.delete({ where: { id } });
  }

  async createLot(dto: CreateStockLotDto) {
    const sku = await this.prisma.sKU.findUnique({ where: { id: dto.skuId }, include: { product: true } });
    if (!sku) {
      throw new NotFoundException('SKU não encontrado');
    }

    const location = await this.prisma.stockLocation.findUnique({ where: { id: dto.locationId } });
    if (!location) {
      throw new NotFoundException('Localização não encontrada');
    }

    if (sku.product.controlsBatch && !dto.lotCode) {
      throw new BadRequestException('Produto exige controle de lote');
    }

    if (sku.product.controlsExpiry && !dto.expiryDate) {
      throw new BadRequestException('Produto exige controle de validade');
    }

    return this.prisma.stockLot.create({
      data: {
        skuId: dto.skuId,
        locationId: dto.locationId,
        lotCode: dto.lotCode,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        quantity: dto.quantity ?? 0,
      },
    });
  }

  async listLots(skuId?: string, locationId?: string) {
    return this.prisma.stockLot.findMany({
      where: {
        skuId: skuId || undefined,
        locationId: locationId || undefined,
      },
      include: { location: true, sku: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLot(id: string) {
    const lot = await this.prisma.stockLot.findUnique({
      where: { id },
      include: { location: true, sku: true },
    });
    if (!lot) {
      throw new NotFoundException('Lote não encontrado');
    }
    return lot;
  }

  async updateLot(id: string, dto: UpdateStockLotDto) {
    return this.prisma.stockLot.update({
      where: { id },
      data: {
        ...dto,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });
  }

  async removeLot(id: string) {
    return this.prisma.stockLot.delete({ where: { id } });
  }

  async createReservation(dto: CreateStockReservationDto) {
    const sku = await this.prisma.sKU.findUnique({ where: { id: dto.skuId } });
    if (!sku) {
      throw new NotFoundException('SKU não encontrado');
    }

    if (dto.lotId) {
      const lot = await this.prisma.stockLot.findUnique({ where: { id: dto.lotId } });
      if (!lot) {
        throw new NotFoundException('Lote não encontrado');
      }

      const available = lot.quantity - lot.reservedQuantity;
      if (available < dto.quantity) {
        throw new BadRequestException('Quantidade indisponível no lote');
      }

      await this.prisma.stockLot.update({
        where: { id: dto.lotId },
        data: { reservedQuantity: lot.reservedQuantity + dto.quantity },
      });
    }

    const reservation = await this.prisma.stockReservation.create({
      data: {
        skuId: dto.skuId,
        lotId: dto.lotId,
        quantity: dto.quantity,
        referenceId: dto.referenceId,
      },
    });

    const activity = await this.createActivity({
      type: 'RESERVE',
      skuId: reservation.skuId,
      lotId: reservation.lotId || undefined,
      quantity: reservation.quantity,
      reservationId: reservation.id,
    });

    await this.completeActivity(activity.id, { reason: 'Reserva confirmada' });

    return reservation;
  }

  async listReservations(status?: string) {
    return this.prisma.stockReservation.findMany({
      where: { status: status as any },
      include: { sku: true, lot: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReservation(id: string) {
    const reservation = await this.prisma.stockReservation.findUnique({
      where: { id },
      include: { sku: true, lot: true },
    });
    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }
    return reservation;
  }

  async updateReservation(id: string, dto: UpdateStockReservationDto) {
    return this.prisma.stockReservation.update({ where: { id }, data: dto });
  }

  async createActivity(dto: CreateStockActivityDto) {
    const assignedUserId = dto.assignedUserId || (await this.pickActiveOperator());

    const activity = await this.prisma.$transaction(async (prisma) => {
      console.log('Creating activity with data:', {
        type: dto.type,
        skuId: dto.skuId,
        createdByUserId: dto.createdByUserId
      });

      const createdActivity = await prisma.stockActivity.create({
        data: {
          type: dto.type as any,
          skuId: dto.skuId,
          lotId: dto.lotId,
          locationId: dto.locationId,
          destinationLocationId: dto.destinationLocationId,
          reservationId: dto.reservationId,
          quantity: dto.quantity,
          assignedUserId,
          createdByUserId: dto.createdByUserId,
        },
      });

      console.log('Activity created successfully:', createdActivity.id);

      const trace = await prisma.activityTrace.create({
        data: {
          activityId: createdActivity.id,
          status: 'CREATED',
          source: 'API',
          message: 'Atividade criada no sistema.',
          userId: dto.createdByUserId,
        },
      });

      console.log('Trace CREATED created successfully:', trace.id);

      return createdActivity;
    });

    return activity;
  }

  async listActivities(status?: string, assignedUserId?: string) {
    return this.prisma.stockActivity.findMany({
      where: {
        ...(status && { status: status as any }),
        assignedUserId: assignedUserId || undefined,
      },
      include: {
        sku: { include: { product: true } },
        lot: true,
        location: true,
        destinationLocation: true,
        reservation: true,
        assignedUser: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateActivity(id: string, dto: UpdateStockActivityDto) {
    return this.prisma.stockActivity.update({ where: { id }, data: dto as any });
  }

  async assignActivity(id: string, dto: AssignStockActivityDto) {
    const assignedUserId = dto.userId || (await this.pickActiveOperator());
    return this.prisma.stockActivity.update({
      where: { id },
      data: {
        assignedUserId,
        status: 'IN_PROGRESS',
      },
    });
  }

  async completeActivity(
    id: string,
    payload?: { destinationLocationId?: string; reason?: string }
  ) {
    const activity = await this.prisma.stockActivity.findUnique({ where: { id } });
    if (!activity) {
      throw new NotFoundException('Atividade não encontrada');
    }

    if (activity.status === 'FINALIZED') {
      return activity;
    }

    const destinationLocationId = payload?.destinationLocationId ?? activity.destinationLocationId;
    if (activity.type === 'TRANSFER' && !destinationLocationId) {
      throw new BadRequestException('Transferência exige localização de destino');
    }

    const updated = await this.prisma.stockActivity.update({
      where: { id },
      data: {
        destinationLocationId,
        status: activity.status === 'PENDING' ? 'IN_PROGRESS' : activity.status,
      },
    });

    await this.prisma.activityTrace.create({
      data: {
        activityId: updated.id,
        status: 'ASSIGNED',
        source: 'API',
        message: 'Atividade assumida pelo operador.',
        userId: activity.assignedUserId,
      },
    });

    await this.prisma.activityTrace.create({
      data: {
        activityId: updated.id,
        status: 'QUEUED',
        source: 'API',
        message: payload?.reason ? `Atividade enviada para processamento. Motivo: ${payload.reason}` : 'Atividade enviada para a fila de processamento.',
      },
    });

    await this.stockQueue.publishActivity({
      activityId: updated.id,
      type: updated.type,
      skuId: updated.skuId,
      lotId: updated.lotId,
      locationId: updated.locationId,
      destinationLocationId: updated.destinationLocationId,
      quantity: updated.quantity,
      reservationId: updated.reservationId,
      reason: payload?.reason || 'Movimentação confirmada',
    });

    return updated;
  }

  async createActiveOperator(dto: CreateActiveOperatorDto) {
    return this.prisma.activeOperator.upsert({
      where: { userId: dto.userId },
      update: { isActive: true },
      create: { userId: dto.userId, isActive: true },
    });
  }

  async listActiveOperators() {
    return this.prisma.activeOperator.findMany({
      where: { isActive: true },
      include: { user: true },
    });
  }

  async updateActiveOperator(id: string, dto: UpdateActiveOperatorDto) {
    return this.prisma.activeOperator.update({ where: { id }, data: dto });
  }

  async deactivateActiveOperator(id: string) {
    return this.prisma.activeOperator.update({ where: { id }, data: { isActive: false } });
  }

  private async pickActiveOperator() {
    const operators = await this.prisma.activeOperator.findMany({ where: { isActive: true } });
    if (!operators.length) {
      return undefined;
    }

    let selected = operators[0];
    let selectedCount = Number.MAX_SAFE_INTEGER;

    for (const operator of operators) {
      const count = await this.prisma.stockActivity.count({
        where: { assignedUserId: operator.userId, status: 'PENDING' },
      });
      if (count < selectedCount) {
        selected = operator;
        selectedCount = count;
      }
    }

    return selected.userId;
  }

  async getActivityTraces(activityId: string) {
    return this.prisma.activityTrace.findMany({
      where: { activityId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async cancelActivity(id: string, dto: CancelStockActivityDto, userId?: string) {
    const activity = await this.prisma.stockActivity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new Error('Atividade não encontrada');
    }

    if (activity.status === 'FINALIZED') {
      throw new Error('Atividade já finalizada não pode ser cancelada');
    }

    const updated = await this.prisma.$transaction(async (prisma) => {
      await prisma.stockActivity.update({
        where: { id },
        data: { status: 'CANCELLED' as any },
      });

      await prisma.activityTrace.create({
        data: {
          activityId: id,
          status: 'CANCELLED',
          source: 'API',
          message: `Atividade cancelada. Motivo: ${dto.reason || 'Não informado'}`,
          userId: userId || activity.assignedUserId,
        },
      });

      return { id, status: 'CANCELLED' };
    });

    return updated;
  }
}
