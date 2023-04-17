import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PointService } from '../services/point.service';
import { IsAdminGaurd, UserAuthGuard } from 'src/auth/guards';

@Controller('points')
export class PointController {
  constructor(private pointService: PointService) {}

  @Post()
  @UseGuards(UserAuthGuard, IsAdminGaurd)
  async createPointsSystem(
    @Body('totalPayPercentage', ParseIntPipe) totalPayPercentage: number,
    @Body('exchangePercentage', ParseIntPipe) exchangePercentage: number,
    @Body('redeemLimit', ParseIntPipe) redeemLimit: number,
  ) {
    return {
      success: true,
      data: await this.pointService.createPointsPercentages(
        totalPayPercentage,
        exchangePercentage,
        redeemLimit,
      ),
    };
  }

  @Get('admin/points-system')
  @UseGuards(UserAuthGuard, IsAdminGaurd)
  async getPointSystem() {
    return {
      success: true,
      data: await this.pointService.getPointsSystem(),
    };
  }
}
