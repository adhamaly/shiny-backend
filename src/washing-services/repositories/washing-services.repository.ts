import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWashingServiceDTO } from '../dtos/createWashingService.dto';
import { ServiceIcon } from '../../services-icons/schemas/services-icons.schema';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import {
  WashingService,
  WashingServicesModel,
} from '../schemas/washing-services.schema';

@Injectable()
export class WashingServicesRepository {
  populatedPaths = [
    { path: 'icon', select: 'iconPath iconLink', model: ServiceIcon.name },
  ];

  constructor(
    @InjectModel(WashingService.name)
    private readonly washingServicesModel: Model<WashingServicesModel>,
  ) {}

  async create(createWashingServiceDTO: CreateWashingServiceDTO) {
    // Create
    await this.washingServicesModel.create({
      name: createWashingServiceDTO.name,
      description: createWashingServiceDTO.description,
      duration: createWashingServiceDTO.duration,
      durationUnit: createWashingServiceDTO.durationUnit,
      price: createWashingServiceDTO.price,
      pointsToPay: createWashingServiceDTO.pointsToPay,
      icon: createWashingServiceDTO.icon,
    });
  }

  async findAll() {
    return await this.washingServicesModel
      .find()
      .populate(this.populatedPaths)
      .exec();
  }

  async findOneByIdOr404(id: string) {
    const washingService = await this.washingServicesModel
      .findById(id)
      .populate(this.populatedPaths)
      .exec();
    if (!washingService)
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الخدمة',
        en: 'Washing Service not found',
      });

    return washingService;
  }

  async update(id: string, createWashingServiceDTO: CreateWashingServiceDTO) {
    const washingService = await this.findOneByIdOr404(id);
    washingService.name = createWashingServiceDTO.name;
    washingService.description = createWashingServiceDTO.description;
    washingService.duration = createWashingServiceDTO.duration;
    washingService.durationUnit = createWashingServiceDTO.durationUnit;
    washingService.price = createWashingServiceDTO.price;
    washingService.pointsToPay = createWashingServiceDTO.pointsToPay;
    washingService.icon = createWashingServiceDTO.icon;

    await washingService.save();
  }
}