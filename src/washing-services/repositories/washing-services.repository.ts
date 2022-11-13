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
import {
  ServicesCitiesModelName,
  ServicesCitiesModel,
} from '../schemas/services-cities.schema';

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

    for (const element of createWashingServiceDTO.cities) {
      await this.servicesCitiesModel.create({
        washingService: createdWashingService,
        city: element,
      });
    }
  }

  async createServiceForAllCities(
    createWashingServiceDTO: CreateWashingServiceDTO,
    cities: City[],
  ) {
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

    for (const element of cities) {
      await this.servicesCitiesModel.create({
        washingService: createdWashingService,
        city: element,
      });
    }
  }

  async findAll(role: string) {
    const washingServices =
      await this.washingServiceHelpers.findAllWashingServicesQuery(role);

    return washingServices;
  }

  ServicesChecker(servicesList: any) {
    const filtered = servicesList.filter(
      (washingService: any) => washingService.cities.length >= 1,
    );

    return filtered;
  }

  async findOneByIdOr404(id: string, role?: string) {
    return await this.washingServiceHelpers.findOneByIdQuery(id, role);
  }

  async update(id: string, createWashingServiceDTO: CreateWashingServiceDTO) {
    // TODO:
  }
}
