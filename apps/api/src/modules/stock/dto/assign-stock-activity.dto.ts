import { IsOptional, IsString } from 'class-validator';

export class AssignStockActivityDto {
  @IsString()
  @IsOptional()
  userId?: string;
}
