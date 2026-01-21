import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

const STOCK_ACTIVITY_TYPES = ['IN', 'OUT', 'TRANSFER', 'RESERVE', 'RELEASE', 'ADJUSTMENT'] as const;

export class CreateStockActivityDto {
  @IsString()
  @IsIn(STOCK_ACTIVITY_TYPES)
  type!: (typeof STOCK_ACTIVITY_TYPES)[number];

  @IsString()
  @IsNotEmpty()
  skuId!: string;

  @IsString()
  @IsOptional()
  lotId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  destinationLocationId?: string;

  @IsString()
  @IsOptional()
  reservationId?: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsOptional()
  assignedUserId?: string;

  @IsString()
  @IsOptional()
  createdByUserId?: string;
}
