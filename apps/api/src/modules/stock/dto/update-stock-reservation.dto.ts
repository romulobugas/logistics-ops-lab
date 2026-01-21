import { PartialType } from '@nestjs/swagger';
import { CreateStockReservationDto } from './create-stock-reservation.dto';

export class UpdateStockReservationDto extends PartialType(CreateStockReservationDto) {}
