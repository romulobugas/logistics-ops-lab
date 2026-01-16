import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateSkuDto {
  @IsString()
  @IsOptional()
  ean?: string;

  @IsString()
  @IsNotEmpty()
  unitId!: string;

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

  @IsNumber()
  @IsOptional()
  weightKg?: number;

  @IsNumber()
  @IsOptional()
  volumeM3?: number;

  @IsNumber()
  @IsOptional()
  heightCm?: number;

  @IsNumber()
  @IsOptional()
  widthCm?: number;

  @IsNumber()
  @IsOptional()
  lengthCm?: number;

  @IsString()
  @IsOptional()
  standardPallet?: string;

  @IsString()
  @IsOptional()
  standardBox?: string;

  @IsNumber()
  @IsOptional()
  maxHeightCm?: number;

  @IsNumber()
  @IsOptional()
  palletizing?: number;

  @IsNumber()
  @IsOptional()
  lastro?: number;

  @IsString()
  @IsOptional()
  recipientType?: string;

  @IsBoolean()
  @IsOptional()
  allowBarcodeZero?: boolean;

  @IsBoolean()
  @IsOptional()
  allowConsignated?: boolean;

  @IsBoolean()
  @IsOptional()
  allowOverlap?: boolean;

  @IsBoolean()
  @IsOptional()
  allowTumble?: boolean;

  @IsString()
  @IsNotEmpty()
  productId!: string;
}
