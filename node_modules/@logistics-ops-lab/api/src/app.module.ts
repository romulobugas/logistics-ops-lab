import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { StockModule } from './modules/stock/stock.module';
import { AuthModule } from './modules/auth/auth.module';

import { UnitModule } from './modules/unit/unit.module';
import { ProductGroupModule } from './modules/product-group/product-group.module';
import { StorageGroupModule } from './modules/storage-group/storage-group.module';
import { ProductModule } from './modules/product/product.module';
import { SkuModule } from './modules/sku/sku.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HealthModule,
    StockModule,
    AuthModule,
    UnitModule,
    ProductGroupModule,
    StorageGroupModule,
    ProductModule,
    SkuModule,
  ],
})
export class AppModule {}
