import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { City, CityModel, cityModelName } from './schemas/city.schema';
import { Model } from 'mongoose';
import { AdminService } from '../admin/admin.service';
import { Admin, Roles } from '../admin/schemas/admin.schema';
import { MethodNotAllowedResponse } from '../common/errors/MethodNotAllowedResponse';

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel(cityModelName) private readonly cityModel: Model<CityModel>,
    private adminService: AdminService,
  ) {}

  async getCities() {
    return await this.cityModel.find({ isExist: true }).exec();
  }

  async getAdminCities(role: string, adminId?: string) {
    let admin: Admin;
    if (role === Roles.SubAdmin) {
      admin = await this.adminService.getById(adminId);
    }
    return await this.cityModel
      .find({
        isExist: true,
        ...(role === Roles.SuperAdmin ? {} : { _id: { $in: admin.city } }),
      })
      .exec();
  }

  async getArchivedCities(role: string, adminId?: string) {
    const admin = await this.adminService.getById(adminId);
    return await this.cityModel
      .find({
        isExist: false,
        ...(role === Roles.SuperAdmin ? {} : { _id: { $in: admin.city } }),
      })
      .exec();
  }

  async updateCityExistence(cityId: string, isExist: boolean) {
    await this.cityModel
      .updateOne({ _id: cityId }, { $set: { isExist: isExist } })
      .exec();
  }

  async checkCityExistence(city: City) {
    const cityExistence = await this.cityModel
      .findOne({
        _id: city,
        isExist: true,
      })
      .exec();

    if (!cityExistence)
      throw new MethodNotAllowedResponse({
        ar: 'هذه المدينة مغلقة',
        en: 'City is Archived',
      });
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
