import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SubscriptionsRepository } from '../repositories/subscriptions.repository';
import { Plan } from '../../plans/schemas/plans.schema';
import { PlansService } from '../../plans/services/plans.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/schemas/user.schema';
import { MethodNotAllowedResponse } from '../../common/errors/MethodNotAllowedResponse';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  SubscriptionsStatus,
  Subscription,
} from '../schemas/subscriptions.schema';
import { GetSubscriptionByLocationDTO } from '../dtos/subscriptionByLocation.dto';
import { NearestCityCalculator } from '../../city/nearestCityCalculator.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private subscriptionsRepository: SubscriptionsRepository,
    @Inject(forwardRef(() => PlansService))
    private plansService: PlansService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private nearestCityCalculator: NearestCityCalculator,
  ) {}

  async createUserSubscription(userId: string, planId: string) {
    const user = await this.userService.getUserById(userId);

    if (await this.isUserHasSubscription(user))
      throw new MethodNotAllowedResponse({
        ar: 'انت مشترك في باقة اخري',
        en: 'You Have Already Subscribed',
      });

    const plan = await this.plansService.getById(planId);

    const expiryDate = this.calculateExpiryDate(plan.duration);

    await this.subscriptionsRepository.create(user, plan, expiryDate);

    await this.userService.pointsEarningUpdate(userId, plan.pointsToPay);
  }

  calculateExpiryDate(duration: number) {
    const currentDate = new Date();
    return new Date(currentDate.setMonth(currentDate.getMonth() + duration));
  }

  async isUserHasSubscription(user: User) {
    return await this.subscriptionsRepository.findOne(user);
  }

  async getUserSubscription(userId: string) {
    const user = await this.userService.getUserById(userId);

    return await this.subscriptionsRepository.findOnePopulated(user);
  }

  async getById(subscriptionId: string) {
    return await this.subscriptionsRepository.findById(subscriptionId);
  }

  async decrementUserRemainigWashes(subscription: Subscription) {
    await this.subscriptionsRepository.decrementUserRemaingWashes(subscription);
  }

  async getUserSubscriptionByLocation(
    userId: string,
    getSubscriptionByLocationDTO: GetSubscriptionByLocationDTO,
  ) {
    const user = await this.userService.getUserById(userId);
    const subscription = await this.subscriptionsRepository.findOneWithPlan(
      user,
    );
    if (!subscription)
      throw new MethodNotAllowedResponse({
        ar: 'انت ليس مشترك في باقة',
        en: 'You Have No Subscription',
      });

    if (
      !this.nearestCityCalculator.isCountryBoundariesValid(
        getSubscriptionByLocationDTO.country,
      )
    )
      return {
        subscription,
        message:
          user.language === 'en'
            ? 'Our Service Not Exist Waiting for us soon..'
            : 'خدماتنا غير متوفرة حاليا',
      };

    const city = await this.nearestCityCalculator.findNearestCity(
      Number(getSubscriptionByLocationDTO.latitude),
      Number(getSubscriptionByLocationDTO.longitude),
    );

    if (!this.nearestCityCalculator.isCityExistenceValid(city['city']))
      return {
        subscription,
        message:
          user.language === 'en'
            ? 'Our Service Not Exist Waiting for us soon..'
            : 'خدماتنا غير متوفرة حاليا',
      };

    const isPlanExistInCity =
      await this.plansService.checkPlanExistenceWithCity(
        subscription.plan,
        city['city'],
      );

    return {
      subscription,
      message: isPlanExistInCity
        ? ''
        : 'Your plan is not accepted in this city',
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkSubscriptionsExpiryDateReached() {
    console.log(`Subscriptions Expiry Date Reached Started at ${new Date()}`);
    const today = new Date();

    // Get the Subscruption that today or befor is its expairy date
    const expairedSubscriptions = await this.subscriptionsRepository.findAll({
      expiryDate: { $lte: today },
      status: SubscriptionsStatus.ACTIVE,
    });

    console.log(
      `Number of Subscriptions to be Exipred at ${new Date()} is ${
        expairedSubscriptions.length
      }`,
    );

    // TODO: Send notifications to the Subscriptions Users

    // Set the status of the Subscriptions to EXPIRED
    await this.subscriptionsRepository.update(
      {
        _id: {
          $in: expairedSubscriptions.map(
            (expiredSubscription) => expiredSubscription._id,
          ),
        },
      },
      { status: SubscriptionsStatus.EXPIRED },
    );
  }
}
