import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePlanDTO, UpdatePlanDTO } from '../dtos';
import { Plan, PlansModel, plansModelName } from '../schemas/plans.schema';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import { PlansQueriesHelpers } from '../queries-helpers/plans-queries.helper';
import { City } from '../../city/schemas/city.schema';

@Injectable()
export class PlansRepository {
  // Attributes

  constructor(
    @InjectModel(plansModelName) private readonly plansModel: Model<PlansModel>,
    private plansQueriesHelpers: PlansQueriesHelpers,
  ) {}

  // Functions
  async create(createPlanDTO: CreatePlanDTO) {
    const createdPlan = await this.plansModel.create({
      type: createPlanDTO.type,
      color: createPlanDTO.color,
      price: createPlanDTO.price,
      duration: createPlanDTO.duration,
      durationUnit: createPlanDTO.durationUnit,
      pointsToPay: createPlanDTO.pointsToPay,
      washingServices: createPlanDTO.washingServices,
      usageCount: createPlanDTO.usageCount,
    });

    return createdPlan;
  }
  async findAll(role: string, city?: City[]) {
    console.log(city);
    return await this.plansQueriesHelpers.findAllPlansQuery(role, city);
  }
  async findByIdOr404(id: string, role: string, city: City[]) {
    return await this.plansQueriesHelpers.findOneByIdQuery(id, role, city);
  }
  async update(id: string, updatePlanDTO: UpdatePlanDTO) {
    const plan = await this.findOneByIdOr404(id);

    plan.type = updatePlanDTO.type;
    plan.color = updatePlanDTO.color;
    plan.price = updatePlanDTO.price;
    plan.duration = updatePlanDTO.duration;
    plan.durationUnit = updatePlanDTO.durationUnit;
    plan.pointsToPay = updatePlanDTO.pointsToPay;
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
}
