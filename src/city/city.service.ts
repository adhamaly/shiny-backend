import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { City, CityModel } from './schemas/city.schema';
import { Model } from 'mongoose';

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel(City.name) private readonly cityModel: Model<CityModel>,
  ) {}

  async getCities() {
    return await this.cityModel.find().exec();
  }

  async injectCities() {
    const citiesExists = await this.cityModel.count().exec();
    if (citiesExists) return;

    await this.cityModel.create([
      { name: 'القاهرة', latitude: 30.06263, longitude: 31.24967 },
      { name: 'الاسكندرية', latitude: 31.21564, longitude: 29.95527 },
      { name: 'بورسعيد', latitude: 31.25654, longitude: 32.28411 },
    ]);
  }
}
