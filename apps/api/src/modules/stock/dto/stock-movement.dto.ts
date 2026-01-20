import { IsString, IsNotEmpty, IsNumber, IsIn, Min, MaxLength, IsOptional } from 'class-validator';

export class StockMovementDto {
  @IsString()
  @IsNotEmpty()
  skuCode!: string;

  @IsString()
  @IsOptional()
  @IsIn(['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER'])
  type?: string;

  @IsString()
  @IsOptional()
  lotId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  destinationLocationId?: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  reason!: string;
}
