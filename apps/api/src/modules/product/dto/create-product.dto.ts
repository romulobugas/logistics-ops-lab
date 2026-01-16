import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  depositor?: string;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsString()
  @IsOptional()
  productType?: string;

  @IsString()
  @IsOptional()
  sanitaryClassification?: string;

  @IsInt()
  @IsOptional()
  shelfLifeDays?: number;

  @IsInt()
  @IsOptional()
  usefulLifeDays?: number;

  @IsInt()
  @IsOptional()
  quarantineDays?: number;

  @IsInt()
  @IsOptional()
  minStockLevel?: number;

  @IsInt()
  @IsOptional()
  maxStockLevel?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  controlsExpiry?: boolean;

  @IsBoolean()
  @IsOptional()
  closedPanel?: boolean;

  @IsBoolean()
  @IsOptional()
  showOnEntryNote?: boolean;

  @IsBoolean()
  @IsOptional()
  makesOrder?: boolean;

  @IsBoolean()
  @IsOptional()
  controlsBatch?: boolean;

  @IsBoolean()
  @IsOptional()
  gridSewing?: boolean;

  @IsBoolean()
  @IsOptional()
  quarantine?: boolean;

  @IsBoolean()
  @IsOptional()
  dynamicPicking?: boolean;

  @IsBoolean()
  @IsOptional()
  separationMagnitude?: boolean;

  @IsBoolean()
  @IsOptional()
  informExpiryOnCheck?: boolean;

  @IsBoolean()
  @IsOptional()
  isProductKit?: boolean;

  @IsBoolean()
  @IsOptional()
  specialComposition?: boolean;

  @IsString()
  @IsOptional()
  productGroupId?: string;

  @IsString()
  @IsOptional()
  storageGroupId?: string;

  @IsString()
  @IsOptional()
  baseUnitId?: string;

  @IsString()
  @IsOptional()
  entryUnitId?: string;

  @IsString()
  @IsOptional()
  storageUnitId?: string;

  @IsString()
  @IsOptional()
  pickingUnitId?: string;

  @IsString()
  @IsOptional()
  altPickingUnitId?: string;
}
