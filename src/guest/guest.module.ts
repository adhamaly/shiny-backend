import { Module } from '@nestjs/common';
import { CityModule } from '../city/city.module';
import { WashingServicesModule } from '../washing-services/washing-services.module';
import { PlansModule } from '../plans/plans.module';
import { GuestService } from './guest.service';
import { GuestControllers } from './guest.controller';

@Module({
  imports: [CityModule, WashingServicesModule, PlansModule],
  providers: [GuestService],
  controllers: [GuestControllers],
})
export class GuestModule {}
