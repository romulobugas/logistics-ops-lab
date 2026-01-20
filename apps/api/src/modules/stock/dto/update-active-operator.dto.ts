import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateActiveOperatorDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
