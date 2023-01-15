import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { locationModelName, LocationsModel } from '../schemas/location.schema';
import { City } from '../../city/schemas/city.schema';
import { User } from '../../user/schemas/user.schema';

@Injectable()
export class LocationsRepository {
  constructor(
    @InjectModel(locationModelName)
    private readonly locationsModel: Model<LocationsModel>,
  ) {}

  /**
   * Create new Location and return it
   */
  async create(
    user: User,
    city: City,
    location: {
      latitude: number;
      longitude: number;
      streetName: string;
      subAdministrativeArea: string;
      country: string;
    },
    forSave: boolean,
  ) {
    return await this.locationsModel.create({
      latitude: location.latitude,
      longitude: location.longitude,
      streetName: location.streetName,
      subAdministrativeArea: location.subAdministrativeArea,
      city: city,
      country: location.country,
      user: user,
      ...(forSave ? { type: 'SAVED_LOCATION' } : { type: 'RECENT_LOCATION' }),
    });
  }
  async findAll(user: User, isSaved: boolean) {
    // TODO
    return await this.locationsModel
      .find({
        user: user,
        ...(isSaved
          ? { isSaved: true }
          : { isSaved: false, type: 'RECENT_LOCATION' }),
      })
      .sort({ createdAt: 'desc' })
      .exec();
  }

  async findById(id: string) {
    // TODO

    return await this.locationsModel.findById(id).exec();
  }
  /**
   *
   * @param latitude
   * @param longitude
   * @param streetName
   *
   *
   */
  async findOne(user: User, latitude: number, longitude: number) {
    // TODO

    return await this.locationsModel
      .findOne({
        user: user,
        latitude: latitude,
        longitude: longitude,
      })
      .exec();
  }
  async updateLocations(user: User) {
    await this.locationsModel
      .updateMany(
        {
          user: user,
        },
        { $set: { isSaved: false }, $unset: { savedName: '' } },
      )
      .exec();
  }

  async updateOne(id: string) {
    await this.locationsModel
      .updateOne(
        {
          _id: id,
        },
        { $set: { isSaved: false }, $unset: { savedName: '' } },
      )
      .exec();
  }

  async findManyQuery(queryFilter: any) {
    return await this.locationsModel.find(queryFilter).exec();
  }
}
