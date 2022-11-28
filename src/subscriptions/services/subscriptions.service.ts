import { Injectable } from '@nestjs/common';
import { SubscriptionsRepository } from '../repositories/subscriptions.repository';
import { Plan } from '../../plans/schemas/plans.schema';
import { PlansService } from '../../plans/services/plans.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/schemas/user.schema';
import { MethodNotAllowedResponse } from '../../common/errors/MethodNotAllowedResponse';

@Injectable()
export class SubscriptionsService {
  constructor(
    private subscriptionsRepository: SubscriptionsRepository,
    private plansService: PlansService,
    private userService: UserService,
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
}
