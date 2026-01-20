import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateStockLotDto {
  @IsString()
  @IsNotEmpty()
  skuId!: string;

  @IsString()
  @IsNotEmpty()
  locationId!: string;

  @IsString()
  @IsOptional()
  lotCode?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;
}
