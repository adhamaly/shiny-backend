import { Controller, Get } from '@nestjs/common';
import { ServicesIconsService } from './services-icons.service';

@Controller('services-icons')
export class ServicesIconsController {
  constructor(private servicesIconsService: ServicesIconsService) {}

  @Get('')
  async getIconsController() {
    return {
      success: true,
      data: await this.servicesIconsService.getAll(),
    };
  }
}
