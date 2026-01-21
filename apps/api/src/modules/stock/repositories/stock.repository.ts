import { Injectable } from '@nestjs/common';
import { SKU, StockBalance } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSku(data: {
    ean?: string;
    unitId: string;
    productId: string;
    conversionFactor?: number;
    brand?: string;
    color?: string;
    size?: string;
  }): Promise<SKU> {
    return this.prisma.sKU.create({
      data,
    });
  }

  async findSkuByCode(ean: string): Promise<SKU | null> {
    return this.prisma.sKU.findUnique({
      where: { ean },
    });
  }

  async findSkuById(id: string): Promise<SKU | null> {
    return this.prisma.sKU.findUnique({
      where: { id },
    });
  }

  async createOrUpdateStockBalance(skuId: string, quantity: number): Promise<StockBalance> {
    return this.prisma.stockBalance.upsert({
      where: { skuId },
      update: { quantity },
      create: { skuId, quantity },
    });
  }

  async getStockBalance(skuId: string): Promise<StockBalance | null> {
    return this.prisma.stockBalance.findUnique({
      where: { skuId },
    });
  }

  async createStockMovement(data: {
    skuId: string;
    lotId?: string;
    locationId?: string;
    destinationLocationId?: string;
    type: string;
    quantity: number;
    reason: string;
  }) {
    return this.prisma.stockMovement.create({
      data,
    });
  }
}
