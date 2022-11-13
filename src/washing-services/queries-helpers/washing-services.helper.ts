import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { servicesIconModelName } from '../../services-icons/schemas/services-icons.schema';
import {
  WashingServicesModelName,
  WashingServicesModel,
} from '../schemas/washing-services.schema';
import mongoose, { Document, Model, Mongoose, Types } from 'mongoose';
import {
  ServicesCitiesModelName,
  ServicesCitiesModel,
} from '../schemas/services-cities.schema';

@Injectable()
export class WashingServiceHelpers {
  populatedPaths = [
    { path: 'icon', select: 'iconPath iconLink', model: servicesIconModelName },
  ];

  constructor(
    @InjectModel(WashingServicesModelName)
    private readonly washingServicesModel: Model<WashingServicesModel>,
    @InjectModel(ServicesCitiesModelName)
    private readonly servicesCitiesModel: Model<ServicesCitiesModel>,
  ) {}

  async findAllWashingServicesQuery(role: string) {
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
                  ...(role === 'superAdmin' || role === 'subAdmin'
                    ? {}
                    : {
                        isArchived: false,
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

  async findOneByIdQuery(id: string, role: string) {
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
                  ...(role === 'superAdmin' || role === 'subAdmin'
                    ? {}
                    : {
                        isArchived: false,
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

    return washingService;
  }
}
