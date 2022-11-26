import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { City } from '../../city/schemas/city.schema';
import { plansModelName, PlansModel } from '../schemas/plans.schema';
import { plansCitiesModelName, PlanCity } from '../schemas/plans-cities.schema';
import { WashingServicesModelName } from '../../washing-services/schemas/washing-services.schema';
import { Roles } from 'src/admin/schemas/admin.schema';

@Injectable()
export class PlansQueriesHelpers {
  populatedPaths = [
    {
      path: 'washingServices',
      select: 'name',
      model: WashingServicesModelName,
    },
  ];

  constructor(
    @InjectModel(plansModelName)
    private readonly plansModel: Model<PlansModel>,
    @InjectModel(plansCitiesModelName)
    private readonly plansCitiesModel: Model<PlanCity>,
  ) {}

  async findAllPlansQuery(role: string, city?: City[]) {
    const plans = await this.plansModel
      .aggregate([
        {
          $lookup: {
            from: 'plans-cities',
            let: { planId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$$planId', '$plan'] },
                  ...(role === Roles.SubAdmin
                    ? { city: { $in: city } }
                    : role === Roles.SuperAdmin
                    ? {}
                    : role === 'user' || role === 'guest'
                    ? {
                        isArchived: false,
                        city: { $in: city },
                      }
                    : {}),
                },
              },
              {
                $lookup: {
                  from: 'cities',
                  let: { cityId: '$city' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$$cityId', '$_id'] },
                      },
                    },
                  ],
                  as: 'city',
                },
              },
              { $project: { _id: 0, plan: 0 } },

              { $unwind: '$city' },
            ],
            as: 'cities',
          },
        },
      ])
      .exec();

    await this.plansModel.populate(plans, this.populatedPaths);

    return plans;
  }

  async findOneByIdQuery(id: string, role: string, city: City[]) {
    const plan = await this.plansModel
      .aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: 'plans-cities',
            let: { planId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$$planId', '$plan'] },
                  ...(role === Roles.SubAdmin
                    ? { city: { $in: city } }
                    : {
                        isArchived: false,
                        city: { $in: city },
                      }),
                },
              },
              {
                $lookup: {
                  from: 'cities',
                  let: { cityId: '$city' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$$cityId', '$_id'] },
                      },
                    },
                  ],
                  as: 'city',
                },
              },
              { $project: { _id: 0, plan: 0 } },

              { $unwind: '$city' },
            ],
            as: 'cities',
          },
        },
      ])
      .exec();

    await this.plansModel.populate(plan, this.populatedPaths);

    return plan[0];
  }
}
