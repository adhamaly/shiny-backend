import { Controller, Get, UseGuards } from '@nestjs/common';
import { Account } from 'src/common/decorators/user.decorator';
import { UserAuthGuard } from '../auth/guards';
import { CitiesService } from './city.service';

@Controller('cities')
export class CitiesController {
  constructor(private citiesService: CitiesService) {}

  @Get('/admin')
  @UseGuards(UserAuthGuard)
  async getAllController(@Account() account: any) {
    return {
      success: true,
      data: await this.citiesService.getAdminCities(account.role, account.id),
    };
  }
}
