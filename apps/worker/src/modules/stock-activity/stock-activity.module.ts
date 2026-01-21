import { Module } from '@nestjs/common';
import { StockActivityConsumerService } from './stock-activity.service';

@Module({
  providers: [StockActivityConsumerService],
})
export class StockActivityModule {}
