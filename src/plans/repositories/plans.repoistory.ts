import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePlanDTO } from '../dtos';
import { Plan, PlansModel } from '../schemas/plans.schema';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';

@Injectable()
export class PlansRepository {
  // Attributes

  constructor(
    @InjectModel(Plan.name) private readonly plansModel: Model<PlansModel>,
  ) {}

  // Functions
  async create(createPlanDTO: CreatePlanDTO) {
    await this.plansModel.create({
      type: createPlanDTO.type,
      color: createPlanDTO.color,
      price: createPlanDTO.price,
      duration: createPlanDTO.duration,
      durationUnit: createPlanDTO.durationUnit,
      washingServices: createPlanDTO.washingServices,
    });
  }
  async findAll(role: string) {
    return await this.plansModel
      .find({
        ...(role === 'subAdmin' || role === 'superAdmin'
          ? {}
          : { isArchived: false }),
      })
      .exec();
  }
  async findByIdOr404(id: string) {
    const plan = await this.plansModel.findById(id).exec();
    if (!plan)
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الباقة',
        en: 'Plan not found',
      });

    return plan;
  }
  async update(id: string, createPlanDTO: CreatePlanDTO) {
    const plan = await this.findByIdOr404(id);

    plan.type = createPlanDTO.type;
    plan.color = createPlanDTO.color;
    plan.price = createPlanDTO.price;
    plan.duration = createPlanDTO.duration;
    plan.durationUnit = createPlanDTO.durationUnit;
    plan.washingServices = createPlanDTO.washingServices;

    await plan.save();
  }
}
