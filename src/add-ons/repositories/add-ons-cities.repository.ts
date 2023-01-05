import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City } from '../../city/schemas/city.schema';
import { AddOns } from '../schemas/add-ons.schema';
import { MethodNotAllowedResponse } from '../../common/errors/MethodNotAllowedResponse';
import {
  addOnsCitiesModelName,
  AddOnsCitiesModel,
} from '../schemas/add-ons-cities.schema';

@Injectable()
export class AddOnsCitiesRepository {
  constructor(
    @InjectModel(addOnsCitiesModelName)
    private readonly addOnsCitiesModel: Model<AddOnsCitiesModel>,
  ) {}

  async insertMany(addOns: AddOns, cities: City[]) {
    for (const city of cities) {
      const res = await this.addOnsCitiesModel.create({
        addOns: addOns,
        city: city,
      });
      console.log(res);
    }
  }
  async insertOne(addOns: AddOns, city: City) {
    if (await this.findOne(addOns, city))
      throw new MethodNotAllowedResponse({
        ar: 'السلعة مسجلة من قبل في هذه المدينة',
        en: 'Add-Ons is Already Exist in this city',
      });

    await this.addOnsCitiesModel.create({
      addOns: addOns,
      city: city,
    });
  }
  async deleteOne(addOns: AddOns, city: City) {
    if (!(await this.findOne(addOns, city)))
      throw new MethodNotAllowedResponse({
        ar: 'السلعة لاتوجد في هذه المدينة',
        en: 'Add-Ons is not Exist in this city',
      });

    await this.addOnsCitiesModel
      .deleteOne({
        addOns: addOns,
        city: city,
      })
      .exec();
  }

  async findOne(addOns: AddOns, city: City) {
    const isExist = await this.addOnsCitiesModel
      .findOne({
        addOns: addOns,
        city: city,
      })
      .exec();

    return isExist;
  }
}
