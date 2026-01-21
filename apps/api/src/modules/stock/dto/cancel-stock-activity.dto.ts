import { IsString, IsNotEmpty } from 'class-validator';

export class CancelStockActivityDto {
  @IsString()
  @IsNotEmpty({ message: 'O motivo do cancelamento é obrigatório' })
  reason!: string;
}
