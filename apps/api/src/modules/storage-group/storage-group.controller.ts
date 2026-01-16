import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StorageGroupService } from './storage-group.service';
import { CreateStorageGroupDto } from './dto/create-storage-group.dto';
import { UpdateStorageGroupDto } from './dto/update-storage-group.dto';

@Controller('storage-groups')
export class StorageGroupController {
  constructor(private readonly storageGroupService: StorageGroupService) {}

  @Post()
  create(@Body() createStorageGroupDto: CreateStorageGroupDto) {
    return this.storageGroupService.create(createStorageGroupDto);
  }

  @Get()
  findAll() {
    return this.storageGroupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storageGroupService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStorageGroupDto: UpdateStorageGroupDto) {
    return this.storageGroupService.update(id, updateStorageGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storageGroupService.remove(id);
  }
}
