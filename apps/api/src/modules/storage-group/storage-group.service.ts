import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStorageGroupDto } from './dto/create-storage-group.dto';
import { UpdateStorageGroupDto } from './dto/update-storage-group.dto';

@Injectable()
export class StorageGroupService {
  constructor(private prisma: PrismaService) {}

  create(createStorageGroupDto: CreateStorageGroupDto) {
    return this.prisma.storageGroup.create({ data: createStorageGroupDto });
  }

  findAll() {
    return this.prisma.storageGroup.findMany();
  }

  findOne(id: string) {
    return this.prisma.storageGroup.findUnique({ where: { id } });
  }

  update(id: string, updateStorageGroupDto: UpdateStorageGroupDto) {
    return this.prisma.storageGroup.update({
      where: { id },
      data: updateStorageGroupDto,
    });
  }

  remove(id: string) {
    return this.prisma.storageGroup.delete({ where: { id } });
  }
}
