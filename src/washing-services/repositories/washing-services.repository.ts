import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWashingServiceDTO } from '../dtos/createWashingService.dto';
import { servicesIconModelName } from '../../services-icons/schemas/services-icons.schema';
import {
  WashingServicesModelName,
  WashingServicesModel,
} from '../schemas/washing-services.schema';
import { City } from '../../city/schemas/city.schema';
import { WashingServiceHelpers } from '../queries-helpers/washing-services.helper';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import {
  ServicesCitiesModelName,
  ServicesCitiesModel,
} from '../schemas/services-cities.schema';
import { title } from 'process';
import { ServicesCitiesRepository } from './services-cities.repository';

@Injectable()
export class WashingServicesRepository {
  populatedPaths = [
    { path: 'icon', select: 'iconPath iconLink', model: servicesIconModelName },
  ];

  constructor(
    @InjectModel(WashingServicesModelName)
    private readonly washingServicesModel: Model<WashingServicesModel>,
    @InjectModel(ServicesCitiesModelName)
    private readonly servicesCitiesModel: Model<ServicesCitiesModel>,
    private washingServiceHelpers: WashingServiceHelpers,
  ) {}

  async create(createWashingServiceDTO: CreateWashingServiceDTO) {
    // CreateService
    const createdWashingService = await this.washingServicesModel.create({
      name: createWashingServiceDTO.name,
      description: createWashingServiceDTO.description,
      duration: createWashingServiceDTO.duration,
      durationUnit: createWashingServiceDTO.durationUnit,
      price: createWashingServiceDTO.price,
      pointsToPay: createWashingServiceDTO.pointsToPay,
      icon: createWashingServiceDTO.icon,
    });

    return createdWashingService;
  }

  async findAll(role: string, city?: City) {
    const washingServices =
      await this.washingServiceHelpers.findAllWashingServicesQuery(role, city);

    return washingServices;
  }

  async findOneByIdOr404(id: string, role?: string, city?: City) {
    const washingService = await this.washingServiceHelpers.findOneByIdQuery(
      id,
      role,
      city,
    );
    if (!washingService)
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الخدمة',
        en: 'Washing Service Not Found',
      });

    return washingService;
  }

  async update(id: string, createWashingServiceDTO: CreateWashingServiceDTO) {
    // TODO:
    const washingService = await this.findOneOr404(id);

    washingService.name = createWashingServiceDTO.name;
    washingService.description = createWashingServiceDTO.description;
    washingService.duration = createWashingServiceDTO.duration;
    washingService.durationUnit = createWashingServiceDTO.durationUnit;
    washingService.price = createWashingServiceDTO.price;
    washingService.pointsToPay = createWashingServiceDTO.pointsToPay;
    washingService.icon = createWashingServiceDTO.icon;

    await washingService.save();

    return washingService;
  }

  async findOneOr404(id: string) {
    const washingService = await this.washingServicesModel.findById(id).exec();
    if (!washingService)
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الخدمة',
        en: 'Washing Service Not Found',
      });

    return washingService;
  }
}
