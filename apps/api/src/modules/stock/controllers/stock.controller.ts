import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, NotFoundException as HttpNotFoundException } from '@nestjs/common';
import { StockService } from '../services/stock.service';
import { CreateSkuDto } from '../dto/create-sku.dto';
import { StockMovementDto } from '../dto/stock-movement.dto';

@Controller('skus')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSku(@Body() createSkuDto: CreateSkuDto) {
    return this.stockService.createSku(createSkuDto);
  }

  @Get(':code')
  async getSkuByCode(@Param('code') code: string) {
    try {
      return await this.stockService.getSkuByCode(code);
    } catch (error) {
      if (error instanceof HttpNotFoundException) {
        throw error;
      }
      throw error;
    }
  }
}

@Controller('stock')
export class StockMovementController {
  constructor(private readonly stockService: StockService) {}

  @Post('in')
  @HttpCode(HttpStatus.CREATED)
  async stockIn(@Body() stockMovementDto: StockMovementDto) {
    return this.stockService.processStockMovement({
      ...stockMovementDto,
      type: 'IN',
    });
  }

  @Post('out')
  @HttpCode(HttpStatus.CREATED)
  async stockOut(@Body() stockMovementDto: StockMovementDto) {
    return this.stockService.processStockMovement({
      ...stockMovementDto,
      type: 'OUT',
    });
  }

  @Get(':skuCode')
  async getBalance(@Param('skuCode') skuCode: string) {
    try {
      return await this.stockService.getStockBalance(skuCode);
    } catch (error) {
      if (error instanceof HttpNotFoundException) {
        throw error;
      }
      throw error;
    }
  }
}
