import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserAuthGuard } from '../auth/guards';
import { CitiesService } from './city.service';

@Controller('cities')
export class CitiesController {
  constructor(private citiesService: CitiesService) {}

  @Get()
  @UseGuards(UserAuthGuard)
  async getAllController() {
    return {
      success: true,
      data: await this.citiesService.getCities(),
    };
  }
}
