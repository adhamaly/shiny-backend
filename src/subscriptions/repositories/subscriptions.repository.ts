import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, plansModelName } from '../../plans/schemas/plans.schema';
import { User } from '../../user/schemas/user.schema';
import {
  subscriptionsModelName,
  SubscriptionsModel,
  SubscriptionsStatus,
} from '../schemas/subscriptions.schema';

@Injectable()
export class SubscriptionsRepository {
  // Attributes
  populatedPaths = [
    {
      path: 'plan',
      select: 'type color',
      model: plansModelName,
    },
  ];
  constructor(
    @InjectModel(subscriptionsModelName)
    private readonly subscriptionsModel: Model<SubscriptionsModel>,
  ) {}

  async create(user: User, plan: Plan, expiryDate: Date) {
    await this.subscriptionsModel.create({
      user: user,
      plan: plan,
      remainingWashes: plan.usageCount,
      washesCount: plan.usageCount,
      expiryDate: expiryDate,
    });
  }
  async findOne(user: User) {
    return await this.subscriptionsModel
      .findOne({ user: user, status: SubscriptionsStatus.ACTIVE })
      .exec();
  }

  async findOnePopulated(user: User) {
    const userSubscription = await this.subscriptionsModel
      .findOne({ user: user, status: SubscriptionsStatus.ACTIVE })
      .populate(this.populatedPaths)
      .exec();

    return userSubscription;
  }

  async findOneWithPlan(user: User) {
    return await this.subscriptionsModel
      .findOne({ user: user, status: SubscriptionsStatus.ACTIVE })
      .populate([
        {
          path: 'plan',
          model: plansModelName,
        },
      ])
      .exec();
  }

  async findAll(filter: any) {
    return await this.subscriptionsModel.find({ ...filter }).exec();
  }

  async update(filter: any, updatedData: any) {
    await this.subscriptionsModel
      .updateMany(
        {
          ...filter,
        },
        { $set: updatedData },
      )
      .exec();
  }
}
