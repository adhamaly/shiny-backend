import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { servicesIconModelName } from '../../services-icons/schemas/services-icons.schema';
import { City } from '../../city/schemas/city.schema';
import { addOnsModelName, AddOnsModel } from '../schemas/add-ons.schema';
import { CreateAddOnsDTO } from '../dtos/createAddOns.dto';
import { Model } from 'mongoose';

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
              { $project: { _id: 0, washingService: 0 } },

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
}
