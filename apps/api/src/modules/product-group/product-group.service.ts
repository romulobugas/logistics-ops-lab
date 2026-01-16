import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductGroupDto } from './dto/create-product-group.dto';
import { UpdateProductGroupDto } from './dto/update-product-group.dto';

@Injectable()
export class ProductGroupService {
  constructor(private prisma: PrismaService) {}

  create(createProductGroupDto: CreateProductGroupDto) {
    return this.prisma.productGroup.create({ data: createProductGroupDto });
  }

  findAll() {
    return this.prisma.productGroup.findMany();
  }

  findOne(id: string) {
    return this.prisma.productGroup.findUnique({ where: { id } });
  }

  update(id: string, updateProductGroupDto: UpdateProductGroupDto) {
    return this.prisma.productGroup.update({
      where: { id },
      data: updateProductGroupDto,
    });
  }

  remove(id: string) {
    return this.prisma.productGroup.delete({ where: { id } });
  }
}
