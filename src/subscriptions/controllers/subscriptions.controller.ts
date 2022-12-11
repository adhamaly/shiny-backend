import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from '../services/subscriptions.service';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { Account } from 'src/common/decorators/user.decorator';
import { GetSubscriptionByLocationDTO } from '../dtos/subscriptionByLocation.dto';

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
    const subscription = await this.subscriptionsService.getUserSubscription(
      account.id,
    );
    return {
      success: true,
      data: subscription ? subscription : {},
    };
  }

  @Get('/user/location')
  @UseGuards(UserAuthGuard)
  async getUserSubscriptionsByLocationController(
    @Account() account: any,
    @Query() getSubscriptionByLocationDTO: GetSubscriptionByLocationDTO,
  ) {
    const result =
      await this.subscriptionsService.getUserSubscriptionByLocation(
        account.id,
        getSubscriptionByLocationDTO,
      );
    return {
      success: true,
      message: result.message,
      data: result.subscription,
    };
  }
}
