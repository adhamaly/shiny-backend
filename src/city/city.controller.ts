import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Account } from 'src/common/decorators/user.decorator';
import { UserAuthGuard } from '../auth/guards';
import { CitiesService } from './city.service';
import { IsAdminGuard } from '../admin/guard/isAdmin.guard';
import { SuperAdminGuard } from '../auth/guards/superAdmin.guard';

@Controller('cities')
export class CitiesController {
  constructor(private citiesService: CitiesService) {}

  @Get('/admin')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async getAllController(@Account() account: any) {
    return {
      success: true,
      data: await this.citiesService.getAdminCities(account.role, account.id),
    };
  }

  @Patch(':cityId/existance')
  @UseGuards(UserAuthGuard, SuperAdminGuard)
  async updateCityExistance(
    @Param('cityId') cityId: string,
    @Body('isExist', ParseBoolPipe) isExist: boolean,
  ) {
    await this.citiesService.updateCityExistance(cityId, isExist);

    return {
      success: true,
    };
  }
}
