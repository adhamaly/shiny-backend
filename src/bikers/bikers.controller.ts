import { Controller, Get, UseGuards } from '@nestjs/common';
import { Account } from 'src/common/decorators/user.decorator';
import { BikersService } from './bikers.service';
import { UserAuthGuard } from 'src/auth/guards';
import { ProfileOwnerGuard } from './guard/profileOwner.guard';

@Controller('bikers')
export class BikersController {
  constructor(private bikersService: BikersService) {}

  @Get('')
  @UseGuards(UserAuthGuard, ProfileOwnerGuard)
  async getByIdController(@Account() account: any) {
    return {
      success: true,
      data: await this.bikersService.getByIdOr404(account.id),
    };
  }
}
