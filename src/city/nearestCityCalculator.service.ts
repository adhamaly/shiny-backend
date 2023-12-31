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
    const cities = await this.cityModel.find().exec();
    const distances = [];
    for (const city of cities) {
      distances.push({
        city: city,
        distance: this.calculateDistanceFromTo(
          latitude,
          longitude,
          city.latitude,
          city.longitude,
        ),
      });
    }

    const closest = distances.reduce((acc, loc) =>
      acc.distance < loc.distance ? acc : loc,
    );
    console.log(closest);
    return closest;
  }

  calculateDistanceFromTo(
    fromLatitude: number,
    fromLongitude: number,
    toLatitude: number,
    toLongitude: number,
  ) {
    const R = 6371; // km
    const dLat = this.toRad(toLatitude - fromLatitude);
    const dLon = this.toRad(toLongitude - fromLongitude);
    const lat1 = this.toRad(fromLatitude);
    const lat2 = this.toRad(toLatitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d ? Number(d.toFixed(1)) : 0;
  }

  toRad(value: number) {
    return (value * Math.PI) / 180;
  }

  isCountryBoundariesValid(country: string) {
    // TODO: create schema for countries and relate it with cities with key is Exist for each one

    if (country.trim() !== 'Egypt' && country.trim() !== 'egypt') return false;

    return true;
  }
  isCityExistenceValid(nearestCity: City) {
    if (!nearestCity.isExist) return false;

    return true;
  }
}
