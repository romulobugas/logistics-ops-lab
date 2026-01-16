import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateSkuDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  ean?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @IsString()
  @IsNotEmpty()
  unitId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;
}
