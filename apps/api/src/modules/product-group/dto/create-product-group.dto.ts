import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductGroupDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
