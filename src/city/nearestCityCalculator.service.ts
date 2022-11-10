import { Injectable, Module } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { cityModelName, CityModel, City } from './schemas/city.schema';
import { Model } from 'mongoose';

@Injectable()
export class NearestCityCalculator {
  constructor(
    @InjectModel(cityModelName) private readonly cityModel: Model<CityModel>,
  ) {}

  async findNearestCity(latitude: number, longitude: number) {
    const city = await this.cityModel
      .findOne({ latitude: latitude, longitude: longitude })
      .exec();
    return city;
  }
}
