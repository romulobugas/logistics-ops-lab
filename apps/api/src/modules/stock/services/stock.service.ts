import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { StockRepository } from '../repositories/stock.repository';
import { CreateSkuDto } from '../dto/create-sku.dto';
import { StockMovementDto } from '../dto/stock-movement.dto';

@Injectable()
export class StockService {
  constructor(private readonly stockRepository: StockRepository) {}

  async createSku(createSkuDto: CreateSkuDto) {
    // Check if SKU code already exists
    const existingSku = await this.stockRepository.findSkuByCode(createSkuDto.code);
    if (existingSku) {
      throw new ConflictException(`SKU with code '${createSkuDto.code}' already exists`);
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
      skuCode: sku.code,
      description: sku.description,
      unit: sku.unit,
      quantity: balance.quantity,
      updatedAt: balance.updatedAt,
    };
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
    } else {
      throw new BadRequestException(`Invalid movement type: ${stockMovementDto.type}`);
    }

    // Update stock balance
    await this.stockRepository.createOrUpdateStockBalance(sku.id, newBalance);

    // Record movement
    await this.stockRepository.createStockMovement({
      skuId: sku.id,
      type: stockMovementDto.type,
      quantity: stockMovementDto.quantity,
      reason: stockMovementDto.reason,
    });

    return {
      skuCode: sku.code,
      type: stockMovementDto.type,
      quantity: stockMovementDto.quantity,
      previousBalance: currentBalance.quantity,
      newBalance,
      reason: stockMovementDto.reason,
    };
  }
}
