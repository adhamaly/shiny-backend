import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { servicesIconModelName } from '../../services-icons/schemas/services-icons.schema';
import { City } from '../../city/schemas/city.schema';
import { addOnsModelName, AddOnsModel } from '../schemas/add-ons.schema';
import { CreateAddOnsDTO } from '../dtos/createAddOns.dto';
import { Model } from 'mongoose';
import { Roles } from 'src/admin/schemas/admin.schema';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import mongoose from 'mongoose';

@Injectable()
export class AddOnsRepository {
  populatedPaths = [
    { path: 'icon', select: 'iconPath iconLink', model: servicesIconModelName },
  ];

  constructor(
    @InjectModel(addOnsModelName)
    private readonly addOnsModel: Model<AddOnsModel>,
  ) {}

  async create(createAddOnsDTO: CreateAddOnsDTO) {
    const createdAddOns = await this.addOnsModel.create({
      name: createAddOnsDTO.name,
      price: createAddOnsDTO.price,
      icon: createAddOnsDTO.icon,
    });

    return createdAddOns;
  }

  async findAll(city: City) {
    const addOnsList = await this.addOnsModel
      .aggregate([
        {
          $lookup: {
            from: 'add-ons-cities',
            let: { addOnsId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$$addOnsId', '$addOns'] },
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
              { $project: { _id: 0, addOns: 0 } },

              { $unwind: '$city' },
            ],
            as: 'cities',
          },
        },
      ])
      .exec();

    await this.addOnsModel.populate(addOnsList, this.populatedPaths);

    return addOnsList;
  }

  async findAllForAdmins(role: string, cities?: City[]) {
    const addOnses = await this.addOnsModel
      .aggregate([
        {
          $lookup: {
            from: 'add-ons-cities',
            let: { addOnsId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$$addOnsId', '$addOns'] },
                  ...(role === Roles.SubAdmin ? { city: { $in: cities } } : {}),
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
              { $project: { _id: 0, addons: 0 } },

              { $unwind: '$city' },
            ],
            as: 'cities',
          },
        },
      ])
      .exec();

    await this.addOnsModel.populate(addOnses, this.populatedPaths);

    return addOnses;
  }

  async findByIdOr404(id: string) {
    const addOns = await this.addOnsModel
      .aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: 'add-ons-cities',
            let: { addOnsId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$$addOnsId', '$addOns'] },
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
              { $project: { _id: 0, addOns: 0 } },

              { $unwind: '$city' },
            ],
            as: 'cities',
          },
        },
      ])
      .exec();

    await this.addOnsModel.populate(addOns, this.populatedPaths);

    if (!addOns[0])
      throw new NotFoundResponse({
        ar: 'لا توجد',
        en: 'Not Found',
      });

    return addOns[0];
  }
}
