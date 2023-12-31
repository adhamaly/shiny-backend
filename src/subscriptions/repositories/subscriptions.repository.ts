import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, plansModelName } from '../../plans/schemas/plans.schema';
import { User } from '../../user/schemas/user.schema';
import { WashingServicesModelName } from '../../washing-services/schemas/washing-services.schema';
import { Subscription } from '../schemas/subscriptions.schema';
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
      .populate({
        path: 'plan',
        populate: {
          path: 'washingServices',
          select: 'name',
          model: WashingServicesModelName,
        },
        model: plansModelName,
      })
      .exec();
  }

  async findAll(filter: any) {
    return await this.subscriptionsModel.find({ ...filter }).exec();
  }

  async findById(id: string) {
    return await this.subscriptionsModel.findById(id).exec();
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

  async decrementUserRemaingWashes(id: Subscription) {
    await this.subscriptionsModel
      .updateOne(
        {
          _id: id,
        },
        { $inc: { remainingWashes: -1 } },
      )
      .exec();
  }
}
