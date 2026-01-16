import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
  constructor(private prisma: PrismaService) {}

  create(createUnitDto: CreateUnitDto) {
    return this.prisma.unit.create({ data: createUnitDto });
  }

  findAll() {
    return this.prisma.unit.findMany();
  }

  findOne(id: string) {
    return this.prisma.unit.findUnique({ where: { id } });
  }

  update(id: string, updateUnitDto: UpdateUnitDto) {
    return this.prisma.unit.update({
      where: { id },
      data: updateUnitDto,
    });
  }

  remove(id: string) {
    return this.prisma.unit.delete({ where: { id } });
  }
}
