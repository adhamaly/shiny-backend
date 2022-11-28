import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from '../services/subscriptions.service';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { Account } from 'src/common/decorators/user.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post()
  @UseGuards(UserAuthGuard)
  async createSubscriptionsController(
    @Body('plan') plan: string,
    @Account() account: any,
  ) {
    await this.subscriptionsService.createUserSubscription(account.id, plan);

    return {
      success: true,
    };
  }

  @Get('/user')
  @UseGuards(UserAuthGuard)
  async getUserSubscriptionsController(@Account() account: any) {
    return {
      success: true,
      data: await this.subscriptionsService.getUserSubscription(account.id),
    };
  }
}
