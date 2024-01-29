import { Module, forwardRef } from '@nestjs/common';
import { PlansService } from './services/plans.service';
import { MongooseModule } from '@nestjs/mongoose';
import { plansModelName, PlansSchema } from './schemas/plans.schema';
import { PlansController } from './controllers/plans.controller';
import { PlansRepository } from './repositories/plans.repoistory';
import { PlansCitiesRepository } from './repositories/plans-cities.repository';
import { CityModule } from '../city/city.module';
import { UserModule } from '../user/user.module';
import { AdminModule } from '../admin/admin.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import {
  plansCitiesModelName,
  PlansCitiesSchema,
} from './schemas/plans-cities.schema';
import { AppConfig } from 'src/common/services/app-config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: plansModelName, schema: PlansSchema },
      { name: plansCitiesModelName, schema: PlansCitiesSchema },
    ]),
    CityModule,
    forwardRef(() => UserModule),
    forwardRef(() => SubscriptionsModule),
    AdminModule,
  ],
  providers: [PlansService, PlansRepository, PlansCitiesRepository, AppConfig],
  controllers: [PlansController],
  exports: [PlansService, PlansRepository],
})
export class PlansModule {}
