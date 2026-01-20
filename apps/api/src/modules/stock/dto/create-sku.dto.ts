import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber } from 'class-validator';

export class CreateSkuDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  ean?: string;

  @IsString()
  @IsNotEmpty()
  unitId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @IsOptional()
  conversionFactor?: number;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  size?: string;
}
