import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateStockReservationDto {
  @IsString()
  @IsNotEmpty()
  skuId!: string;

  @IsString()
  @IsOptional()
  lotId?: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsOptional()
  referenceId?: string;
}
