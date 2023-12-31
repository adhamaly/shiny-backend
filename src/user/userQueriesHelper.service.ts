import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { userModelName, UserModel } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { UpdateUserLocation } from './dto';
import { City } from '../city/schemas/city.schema';

@Injectable()
export class UserQueriesHelper {
  constructor(
    @InjectModel(userModelName) private readonly userModel: Model<UserModel>,
  ) {}

  async updateUserLocation(
    id: string,
    updateUserLocation: UpdateUserLocation,
    nearestCity: City,
  ) {
    await this.userModel
      .findByIdAndUpdate(id, {
        'location.latitude': Number(updateUserLocation.latitude),
        'location.longitude': Number(updateUserLocation.longitude),
        'location.streetName': updateUserLocation.streetName,
        'location.subAdministrativeArea':
          updateUserLocation.subAdministrativeArea,
        'location.country': updateUserLocation.country,
        'location.city': nearestCity,
      })
      .exec();
  }
}
