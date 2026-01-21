import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, NotFoundException, BadRequestException, UseGuards, Req, Query } from '@nestjs/common';
import { StockService } from '../services/stock.service';
import { CreateSkuDto } from '../dto/create-sku.dto';
import { StockMovementDto } from '../dto/stock-movement.dto';
import { CreateStockLocationDto } from '../dto/create-stock-location.dto';
import { UpdateStockLocationDto } from '../dto/update-stock-location.dto';
import { CreateStockLotDto } from '../dto/create-stock-lot.dto';
import { UpdateStockLotDto } from '../dto/update-stock-lot.dto';
import { CreateStockReservationDto } from '../dto/create-stock-reservation.dto';
import { UpdateStockReservationDto } from '../dto/update-stock-reservation.dto';
import { CreateStockActivityDto, UpdateStockActivityDto, AssignStockActivityDto, CompleteStockActivityDto, CancelStockActivityDto } from '../dto';
import { CreateActiveOperatorDto } from '../dto/create-active-operator.dto';
import { UpdateActiveOperatorDto } from '../dto/update-active-operator.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AuthenticatedRequest } from '../../auth/interfaces/auth.interface';

@Controller('skus')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSku(@Body() createSkuDto: CreateSkuDto) {
    return this.stockService.createSku(createSkuDto);
  }

  @Get(':code')
  async getSkuByCode(@Param('code') code: string) {
    try {
      return await this.stockService.getSkuByCode(code);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }
}

@Controller('stock/locations')
export class StockLocationController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateStockLocationDto) {
    return this.stockService.createLocation(dto);
  }

  @Get()
  findAll() {
    return this.stockService.listLocations();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.getLocation(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStockLocationDto) {
    return this.stockService.updateLocation(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.removeLocation(id);
  }
}

@Controller('stock/lots')
export class StockLotController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateStockLotDto) {
    return this.stockService.createLot(dto);
  }

  @Get()
  findAll(@Query('skuId') skuId?: string, @Query('locationId') locationId?: string) {
    return this.stockService.listLots(skuId, locationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.getLot(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStockLotDto) {
    return this.stockService.updateLot(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.removeLot(id);
  }
}

@Controller('stock/reservations')
export class StockReservationController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateStockReservationDto) {
    return this.stockService.createReservation(dto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.stockService.listReservations(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.getReservation(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStockReservationDto) {
    return this.stockService.updateReservation(id, dto);
  }
}

@Controller('stock/activities')
export class StockActivityController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  create(@Body() dto: CreateStockActivityDto, @Req() req: AuthenticatedRequest) {
    // Adicionar o userId do usuário autenticado
    dto.createdByUserId = req.user.id;
    return this.stockService.createActivity(dto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('assignedUserId') assignedUserId?: string,
  ) {
    return this.stockService.listActivities(status, assignedUserId);
  }

  @Get(':id/traces')
  findTraces(@Param('id') id: string) {
    return this.stockService.getActivityTraces(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStockActivityDto) {
    return this.stockService.updateActivity(id, dto);
  }

  @Patch(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignStockActivityDto) {
    return this.stockService.assignActivity(id, dto);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @Body() dto: CompleteStockActivityDto) {
    return this.stockService.completeActivity(id, dto);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard)
  cancel(@Param('id') id: string, @Body() dto: CancelStockActivityDto, @Req() req: AuthenticatedRequest) {
    return this.stockService.cancelActivity(id, dto, req.user.id);
  }
}

@Controller('stock/operators')
export class ActiveOperatorController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateActiveOperatorDto) {
    return this.stockService.createActiveOperator(dto);
  }

  @Get()
  findAll() {
    return this.stockService.listActiveOperators();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateActiveOperatorDto) {
    return this.stockService.updateActiveOperator(id, dto);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.stockService.deactivateActiveOperator(id);
  }
}

@Controller('stock')
export class StockMovementController {
  constructor(private readonly stockService: StockService) {}

  @Post('in')
  @HttpCode(HttpStatus.CREATED)
  async stockIn(@Body() stockMovementDto: StockMovementDto) {
    return this.stockService.requestStockMovement({
      ...stockMovementDto,
      type: 'IN',
    });
  }

  @Post('out')
  @HttpCode(HttpStatus.CREATED)
  async stockOut(@Body() stockMovementDto: StockMovementDto) {
    return this.stockService.requestStockMovement({
      ...stockMovementDto,
      type: 'OUT',
    });
  }

  @Get('locations/available')
  async getAvailableLocations(@Query('skuId') skuId?: string) {
    return this.stockService.getAvailableLocations(skuId);
  }

  @Get('lots/available')
  async getAvailableLots(@Query('skuId') skuId: string, @Query('locationId') locationId?: string) {
    return this.stockService.getAvailableLots(skuId, locationId);
  }

  @Get('balance/available')
  async getAvailableBalance(@Query('skuId') skuId: string, @Query('locationId') locationId?: string) {
    const available = await this.stockService.getAvailableStock(skuId, locationId);
    return { skuId, locationId, available };
  }

  @Post('transfer')
  @HttpCode(HttpStatus.CREATED)
  async stockTransfer(@Body() stockMovementDto: StockMovementDto) {
    return this.stockService.requestStockMovement({
      ...stockMovementDto,
      type: 'TRANSFER',
    });
  }

  @Get('balances')
  listBalances() {
    return this.stockService.listStockBalances();
  }

  @Get('balances/:skuCode')
  async getBalance(@Param('skuCode') skuCode: string) {
    try {
      return await this.stockService.getStockBalance(skuCode);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }
}
