import { NearestCityCalculator } from '../city/nearestCityCalculator.service';
import { Injectable } from '@nestjs/common';
import { City } from '../city/schemas/city.schema';
import { WashingServiceQueriesHelpers } from '../washing-services/queries-helpers/washing-services.helper';
import { PlansQueriesHelpers } from '../plans/queries-helpers/plans-queries.helper';

@Injectable()
export class GuestService {
  constructor(
    private nearestCityCalculator: NearestCityCalculator,
    private washingServiceQueriesHelpers: WashingServiceQueriesHelpers,
    private plansQueriesHelpers: PlansQueriesHelpers,
  ) {}

  async getAllWashingServices(latitude: number, longitude: number) {
    const city = await this.nearestCityCalculator.findNearestCity(
      latitude,
      longitude,
    );

    const servicesList =
      await this.washingServiceQueriesHelpers.findAllWashingServicesQuery(
        'guest',
        city['city']._id,
      );

    const filtered = servicesList.filter(
      (washingService: any) => washingService.cities.length >= 1,
    );

    filtered.forEach((washingService) => {
      washingService.cities = undefined;
    });
    return filtered;
  }

  async getAllPlans(latitude: number, longitude: number) {
    const city = await this.nearestCityCalculator.findNearestCity(
      latitude,
      longitude,
    );

    const plansList = await this.plansQueriesHelpers.findAllPlansQuery(
      'guest',
      city['city']._id,
    );

    const filtered = plansList.filter((plan: any) => plan.cities.length >= 1);

    filtered.forEach((plan) => {
      plan.cities = undefined;
    });
    return filtered;
  }
}
