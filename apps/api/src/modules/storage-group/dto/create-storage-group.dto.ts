import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStorageGroupDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
