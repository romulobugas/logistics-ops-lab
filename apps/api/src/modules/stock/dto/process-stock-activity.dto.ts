import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ProcessStockActivityDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  reason?: string;
}
