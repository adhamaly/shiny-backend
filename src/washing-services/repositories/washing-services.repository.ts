import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateWashingServiceDTO } from '../dtos/createWashingService.dto';
import { servicesIconModelName } from '../../services-icons/schemas/services-icons.schema';
import {
  WashingServicesModelName,
  WashingServicesModel,
} from '../schemas/washing-services.schema';
import { City } from '../../city/schemas/city.schema';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import {
  ServicesCitiesModelName,
  ServicesCitiesModel,
} from '../schemas/services-cities.schema';
import { UpdateWashingServiceDTO } from '../dtos';
import { Roles } from 'src/admin/schemas/admin.schema';
import { WashingService } from '../schemas/washing-services.schema';

@Injectable()
export class WashingServicesRepository {
  populatedPaths = [
    { path: 'icon', select: 'iconPath iconLink', model: servicesIconModelName },
  ];

  constructor(
    @InjectModel(WashingServicesModelName)
    private readonly washingServicesModel: Model<WashingServicesModel>,
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

  async findAll(city: City) {
    const washingServices = await this.washingServicesModel
      .aggregate([
        {
          $lookup: {
            from: 'services-cities',
            let: { washingServiceId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$$washingServiceId', '$washingService'] },
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
              { $project: { _id: 0, washingService: 0 } },

              { $unwind: '$city' },
            ],
            as: 'cities',
          },
        },
      ])
      .exec();

    await this.washingServicesModel.populate(
      washingServices,
      this.populatedPaths,
    );

    return washingServices;
  }

  async findAllForAdmins(role: string, city?: City[]) {
    const washingServices = await this.washingServicesModel
      .aggregate([
        {
          $lookup: {
            from: 'services-cities',
            let: { washingServiceId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$$washingServiceId', '$washingService'] },
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
              { $project: { _id: 0, washingService: 0 } },

              { $unwind: '$city' },
            ],
            as: 'cities',
          },
        },
      ])
      .exec();

    await this.washingServicesModel.populate(
      washingServices,
      this.populatedPaths,
    );

    return washingServices;
  }

  async findOneByIdOr404(id: string) {
    const washingService = await this.washingServicesModel
      .aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: 'services-cities',
            let: { washingServiceId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$$washingServiceId', '$washingService'] },
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
              { $project: { _id: 0, washingService: 0 } },

              { $unwind: '$city' },
            ],
            as: 'cities',
          },
        },
      ])
      .exec();

    await this.washingServicesModel.populate(
      washingService,
      this.populatedPaths,
    );

    return washingService[0];
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
  async findOrderWashingServices(washingServices: any[]) {
    return await this.washingServicesModel
      .find({ _id: { $in: washingServices } })
      .exec();
  }
}
