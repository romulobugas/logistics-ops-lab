import { IsOptional, IsString } from 'class-validator';

export class CompleteStockActivityDto {
  @IsString()
  @IsOptional()
  destinationLocationId?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
