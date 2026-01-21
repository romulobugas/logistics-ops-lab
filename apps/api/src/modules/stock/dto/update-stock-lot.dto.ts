import { PartialType } from '@nestjs/swagger';
import { CreateStockLotDto } from './create-stock-lot.dto';

export class UpdateStockLotDto extends PartialType(CreateStockLotDto) {}
