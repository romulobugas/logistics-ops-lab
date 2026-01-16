import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({ data: createProductDto });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: { 
        productGroup: true, 
        storageGroup: true, 
        skus: { include: { unit: true } },
        baseUnit: true,
        entryUnit: true,
        storageUnit: true,
        pickingUnit: true,
        altPickingUnit: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { 
        productGroup: true, 
        storageGroup: true, 
        skus: { include: { unit: true } },
        baseUnit: true,
        entryUnit: true,
        storageUnit: true,
        pickingUnit: true,
        altPickingUnit: true,
      },
    });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
