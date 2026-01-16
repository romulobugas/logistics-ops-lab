import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PrismaService } from './services/prisma.service';
import { AuthGuard } from './guards/auth.guard';
import { PermissionGuard } from './guards/permission.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, AuthGuard, PermissionGuard],
  exports: [AuthService, AuthGuard, PermissionGuard, PrismaService],
})
export class AuthModule {}
