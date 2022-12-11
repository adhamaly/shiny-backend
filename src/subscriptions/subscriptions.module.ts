import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionsRepository } from './repositories/subscriptions.repository';
import { SubscriptionsService } from './services/subscriptions.service';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { PlansModule } from '../plans/plans.module';
import { UserModule } from '../user/user.module';
import { CityModule } from '../city/city.module';
import {
  subscriptionsModelName,
  SubscriptionsSchema,
} from './schemas/subscriptions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: subscriptionsModelName, schema: SubscriptionsSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => PlansModule),
    CityModule,
  ],
  providers: [SubscriptionsRepository, SubscriptionsService],
  controllers: [SubscriptionsController],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
