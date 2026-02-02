import { Module } from '@nestjs/common';
import { StockController, StockMovementController, StockLocationController, StockLotController, StockReservationController, StockActivityController, ActiveOperatorController } from './controllers/stock.controller';
import { StockService } from './services/stock.service';
import { StockRepository } from './repositories/stock.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { StockQueueService } from './services/stock-queue.service';
import { RabbitMQManagementService } from './services/rabbitmq-management.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    StockController,
    StockMovementController,
    StockLocationController,
    StockLotController,
    StockReservationController,
    StockActivityController,
    ActiveOperatorController,
  ],
  providers: [StockService, StockRepository, StockQueueService, RabbitMQManagementService],
  exports: [StockService],
})
export class StockModule {}
