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
import { WashingServiceQueriesHelpers } from '../queries-helpers/washing-services.helper';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import {
  ServicesCitiesModelName,
  ServicesCitiesModel,
} from '../schemas/services-cities.schema';
import { UpdateWashingServiceDTO } from '../dtos';

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
    private washingServiceQueriesHelpers: WashingServiceQueriesHelpers,
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

  async findAll(role: string, city?: City[] | string[]) {
    const washingServices =
      await this.washingServiceQueriesHelpers.findAllWashingServicesQuery(
        role,
        city,
      );

    return washingServices;
  }

  async findOneByIdOr404(id: string, role: string, city: City[]) {
    const washingService =
      await this.washingServiceQueriesHelpers.findOneByIdQuery(id, role, city);
    if (!washingService)
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الخدمة',
        en: 'Washing Service Not Found',
      });

    return washingService;
  }

  async update(id: string, updateWashingServiceDTO: UpdateWashingServiceDTO) {
    // TODO:
    const washingService = await this.findOneOr404(id);

    washingService.name = updateWashingServiceDTO.name;
    washingService.description = updateWashingServiceDTO.description;
    washingService.duration = updateWashingServiceDTO.duration;
    washingService.durationUnit = updateWashingServiceDTO.durationUnit;
    washingService.price = updateWashingServiceDTO.price;
    washingService.pointsToPay = updateWashingServiceDTO.pointsToPay;
    washingService.icon = updateWashingServiceDTO.icon;

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
