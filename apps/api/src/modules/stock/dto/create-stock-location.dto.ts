import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStockLocationDto {
  @IsString()
  @IsNotEmpty()
  deposit!: string;

  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsString()
  @IsNotEmpty()
  block!: string;

  @IsString()
  @IsNotEmpty()
  level!: string;

  @IsString()
  @IsNotEmpty()
  apartment!: string;
}
