import { Module } from '@nestjs/common';
import { StockController, StockMovementController } from './controllers/stock.controller';
import { StockService } from './services/stock.service';
import { StockRepository } from './repositories/stock.repository';

@Module({
  controllers: [StockController, StockMovementController],
  providers: [StockService, StockRepository],
  exports: [StockService],
})
export class StockModule {}
