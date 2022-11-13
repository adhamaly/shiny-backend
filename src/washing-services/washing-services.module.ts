import { Module } from '@nestjs/common';
import { WashingServicesService } from './services/washing-services.service';
import { WashingServicesController } from './controllers/washing-services.controller';
import { WashingServicesRepository } from './repositories/washing-services.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesIconsModule } from '../services-icons/services-icons.module';
import { CityModule } from '../city/city.module';
import { WashingServiceHelpers } from './queries-helpers/washing-services.helper';
import { UserModule } from '../user/user.module';
import {
  ServicesCitiesModelName,
  ServicesCitiesSchema,
} from './schemas/services-cities.schema';
import {
  WashingServicesModelName,
  WashingServicesSchema,
} from './schemas/washing-services.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WashingServicesModelName, schema: WashingServicesSchema },
      { name: ServicesCitiesModelName, schema: ServicesCitiesSchema },
    ]),
    ServicesIconsModule,
    CityModule,
    UserModule,
  ],
  providers: [
    WashingServicesService,
    WashingServicesRepository,
    WashingServiceHelpers,
  ],
  controllers: [WashingServicesController],
})
export class WashingServicesModule {}
