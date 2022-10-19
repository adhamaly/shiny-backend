import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { City } from './schemas/city.schema';
import { Model } from 'mongoose';

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel(City.name) private readonly cityModel: Model<City>,
  ) {}

  async getCities() {
    return await this.cityModel.find().exec();
  }

  async injectCities() {
    const citiesExists = await this.cityModel.count().exec();
    if (citiesExists) return;

    await this.cityModel.create([
      { name: 'القاهرة' },
      { name: 'الاسكندرية' },
      { name: 'بورسعيد' },
    ]);
  }
}
