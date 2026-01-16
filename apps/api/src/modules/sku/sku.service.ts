import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSkuDto } from './dto/create-sku.dto';
import { UpdateSkuDto } from './dto/update-sku.dto';

@Injectable()
export class SkuService {
  constructor(private prisma: PrismaService) {}

  create(createSkuDto: CreateSkuDto) {
    return this.prisma.sKU.create({ data: createSkuDto });
  }

  findAll() {
    return this.prisma.sKU.findMany({ 
      include: { 
        unit: true, 
        product: { 
          include: {
            baseUnit: true,
            entryUnit: true,
            storageUnit: true,
            pickingUnit: true,
            altPickingUnit: true,
          }
        } 
      } 
    });
  }

  findOne(id: string) {
    return this.prisma.sKU.findUnique({ 
      where: { id }, 
      include: { 
        unit: true, 
        product: { 
          include: {
            baseUnit: true,
            entryUnit: true,
            storageUnit: true,
            pickingUnit: true,
            altPickingUnit: true,
          }
        } 
      } 
    });
  }

  update(id: string, updateSkuDto: UpdateSkuDto) {
    return this.prisma.sKU.update({
      where: { id },
      data: updateSkuDto,
    });
  }

  remove(id: string) {
    return this.prisma.sKU.delete({ where: { id } });
  }
}
