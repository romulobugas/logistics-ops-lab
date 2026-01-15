import { IsString, IsNotEmpty, IsNumber, IsIn, Min, MaxLength } from 'class-validator';

export class StockMovementDto {
  @IsString()
  @IsNotEmpty()
  skuCode!: string;

  @IsString()
  @IsIn(['IN', 'OUT', 'ADJUSTMENT'])
  type!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  reason!: string;
}
