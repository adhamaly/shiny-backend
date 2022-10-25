import { Controller, Get, UseGuards } from '@nestjs/common';
import { Account } from 'src/common/decorators/user.decorator';
import { VehiclesService } from '../vehicles/vehicles.service';
import { UserAuthGuard } from '../auth/guards/userAuthentication.guard';
import { UserAuthorizedGuard } from './guard';

@Controller('users')
export class UserController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get('vehicles')
  @UseGuards(UserAuthGuard, UserAuthorizedGuard)
  async getAllUserVehicles(@Account() account: any) {
    return {
      success: true,
      data: await this.vehiclesService.getAll(account.id),
    };
  }
}
