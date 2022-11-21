import { Module } from '@nestjs/common';
import { PlansService } from './services/plans.service';
import { MongooseModule } from '@nestjs/mongoose';
import { plansModelName, PlansSchema } from './schemas/plans.schema';
import { PlansController } from './controllers/plans.controller';
import { PlansRepository } from './repositories/plans.repoistory';
import { PlansCitiesRepository } from './repositories/plans-cities.repository';
import { CityModule } from '../city/city.module';
import { UserModule } from '../user/user.module';
import { PlansQueriesHelpers } from './queries-helpers/plans-queries.helper';
import {
  plansCitiesModelName,
  PlansCitiesSchema,
} from './schemas/plans-cities.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: plansModelName, schema: PlansSchema },
      { name: plansCitiesModelName, schema: PlansCitiesSchema },
    ]),
    CityModule,
    UserModule,
  ],
  providers: [
    PlansService,
    PlansRepository,
    PlansCitiesRepository,
    PlansQueriesHelpers,
  ],
  controllers: [PlansController],
  exports: [PlansService, PlansRepository, PlansQueriesHelpers],
})
export class PlansModule {}
