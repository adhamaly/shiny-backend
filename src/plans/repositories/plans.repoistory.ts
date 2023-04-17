import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreatePlanDTO, UpdatePlanDTO } from '../dtos';
import { Plan, PlansModel, plansModelName } from '../schemas/plans.schema';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import { City } from '../../city/schemas/city.schema';
import { WashingServicesModelName } from '../../washing-services/schemas/washing-services.schema';
import { Roles } from 'src/admin/schemas/admin.schema';

@Injectable()
export class PlansRepository {
  // Attributes
  populatedPaths = [
    {
      path: 'washingServices',
      select: 'name',
      model: WashingServicesModelName,
    },
  ];
  constructor(
    @InjectModel(plansModelName) private readonly plansModel: Model<PlansModel>,
  ) {}

  // Functions
  async create(createPlanDTO: CreatePlanDTO) {
    const createdPlan = await this.plansModel.create({
      type: createPlanDTO.type,
      color: createPlanDTO.color,
      price: createPlanDTO.price,
      duration: createPlanDTO.duration,
      durationUnit: createPlanDTO.durationUnit,
      washingServices: createPlanDTO.washingServices,
      usageCount: createPlanDTO.usageCount,
    });

    return createdPlan;
  }
  async findAllForAdmins(role: string, city?: City[]) {
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
                  ...(role === Roles.SubAdmin ? { city: { $in: city } } : {}),
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
  async findAll(city: City) {
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
                  isArchived: false,
                  city: city,
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
  async findByIdOr404(id: string) {
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
  async update(id: string, updatePlanDTO: UpdatePlanDTO) {
    const plan = await this.findOneByIdOr404(id);

    plan.type = updatePlanDTO.type;
    plan.color = updatePlanDTO.color;
    plan.price = updatePlanDTO.price;
    plan.duration = updatePlanDTO.duration;
    plan.durationUnit = updatePlanDTO.durationUnit;
    plan.washingServices = updatePlanDTO.washingServices;
    plan.usageCount = updatePlanDTO.usageCount;

    await plan.save();

    return plan;
  }

  async findOneByIdOr404(id: string) {
    const plan = await this.plansModel.findById(id).exec();
    if (!plan)
      throw new NotFoundResponse({
        ar: 'لا توجد هذه الباقة',
        en: 'Plan Not Found',
      });

    return plan;
  }

  async findOne(id: Plan) {
    return await this.plansModel.findOne({ _id: id }).exec();
  }
}
