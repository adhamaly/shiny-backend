import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWashingServiceDTO } from '../dtos/createWashingService.dto';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import { servicesIconModelName } from '../../services-icons/schemas/services-icons.schema';
import { WashingServicesModelName } from '../schemas/washing-services.schema';
import { City } from '../../city/schemas/city.schema';
import {
  ServicesCitiesModelName,
  ServicesCitiesModel,
} from '../schemas/services-cities.schema';
import {
  WashingService,
  WashingServicesModel,
} from '../schemas/washing-services.schema';

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
  ) {}

  async create(
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

    // //
    // for (let i = 0; i < cities.length; i++) {
    //   await this.servicesCitiesModel.create({
    //     washingService: createdWashingService._id,
    //     city: cities[i].id,
    //   });
    // }
  }

  async findAll(role: string) {
    return await this.washingServicesModel
      .find({
        ...(role === 'superAdmin' || role === 'subAdmin'
          ? {}
          : { isArchived: false }),
      })
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
