import { Controller, Get, UseGuards } from '@nestjs/common';
import { ServicesIconsService } from './services-icons.service';
import { UserAuthGuard } from '../auth/guards/userAuthentication.guard';
import { IsAdminGuard } from '../admin/guard/isAdmin.guard';

@Controller('services-icons')
export class ServicesIconsController {
  constructor(private servicesIconsService: ServicesIconsService) {}

  @Get('')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async getIconsController() {
    return {
      success: true,
      data: await this.servicesIconsService.getAll(),
    };
  }
}
