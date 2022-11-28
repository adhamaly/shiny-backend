import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City } from '../../city/schemas/city.schema';
import { AddOns } from '../schemas/add-ons.schema';
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
      await this.addOnsCitiesModel.create({
        addOns: addOns,
        city: city,
      });
    }
  }
}
