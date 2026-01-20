import { PartialType } from '@nestjs/swagger';
import { CreateStockActivityDto } from './create-stock-activity.dto';

export class UpdateStockActivityDto extends PartialType(CreateStockActivityDto) {}
