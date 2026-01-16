import { Module } from '@nestjs/common';
import { StorageGroupService } from './storage-group.service';
import { StorageGroupController } from './storage-group.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StorageGroupController],
  providers: [StorageGroupService],
})
export class StorageGroupModule {}
