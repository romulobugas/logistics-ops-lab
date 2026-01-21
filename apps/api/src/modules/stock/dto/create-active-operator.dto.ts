import { IsNotEmpty, IsString } from 'class-validator';

export class CreateActiveOperatorDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
