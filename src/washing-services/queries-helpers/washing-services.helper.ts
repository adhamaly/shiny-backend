import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { servicesIconModelName } from '../../services-icons/schemas/services-icons.schema';
import {
  WashingServicesModelName,
  WashingServicesModel,
} from '../schemas/washing-services.schema';
import mongoose, { Document, Model, Mongoose, Types } from 'mongoose';
import { City } from '../../city/schemas/city.schema';

@Injectable()
export class WashingServiceHelpers {
  populatedPaths = [
    { path: 'icon', select: 'iconPath iconLink', model: servicesIconModelName },
  ];

  constructor(
    @InjectModel(WashingServicesModelName)
    private readonly washingServicesModel: Model<WashingServicesModel>,
  ) {}

  async findAllWashingServicesQuery(role: string, city?: City) {
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
                        city: city,
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

  async findOneByIdQuery(id: string, role: string, city?: City) {
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
                        city: city,
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

    return washingService[0];
  }
}
