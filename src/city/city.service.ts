import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { City, CityModel, cityModelName } from './schemas/city.schema';
import { Model } from 'mongoose';

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel(cityModelName) private readonly cityModel: Model<CityModel>,
  ) {}

  async getCities() {
    return await this.cityModel.find().exec();
  }

  async injectCities() {
    const citiesExists = await this.cityModel.count().exec();
    if (citiesExists) return;

    await this.cityModel.create([
      {
        'name.ar': 'القاهرة',
        'name.en': 'Cairo',
        latitude: 30.06263,
        longitude: 31.24967,
      },
      {
        'name.ar': 'الإسكندرية',
        'name.en': 'Alexandria',
        latitude: 30.06263,
        longitude: 31.24967,
      },
    ]);
  }
}
