import { PartialType } from '@nestjs/swagger';
import { CreateStorageGroupDto } from './create-storage-group.dto';

export class UpdateStorageGroupDto extends PartialType(CreateStorageGroupDto) {}
