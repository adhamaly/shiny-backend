import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { City, CityModel, cityModelName } from './schemas/city.schema';
import { Model } from 'mongoose';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel(cityModelName) private readonly cityModel: Model<CityModel>,
    private adminService: AdminService,
  ) {}

  async getCities() {
    return await this.cityModel.find().exec();
  }

  async getAdminCities(role: string, adminId: string) {
    const admin = await this.adminService.getById(adminId);
    return await this.cityModel
      .find({
        ...(role === 'superAdmin' ? {} : { _id: { $in: admin.city } }),
      })
      .exec();
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
      {
        'name.ar': 'كفر الشيخ',
        'name.en': 'Kafr El-Sheikh',
        latitude: 30.06263,
        longitude: 31.24967,
      },
      {
        'name.ar': 'دمياط',
        'name.en': 'Domyat',
        latitude: 30.06263,
        longitude: 31.24967,
      },
    ]);
  }
}
