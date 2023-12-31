import { Module } from '@nestjs/common';
import { WashingServicesService } from './services/washing-services.service';
import { WashingServicesController } from './controllers/washing-services.controller';
import { WashingServicesRepository } from './repositories/washing-services.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesIconsModule } from '../services-icons/services-icons.module';
import { CityModule } from '../city/city.module';
import { UserModule } from '../user/user.module';
import {
  ServicesCitiesModelName,
  ServicesCitiesSchema,
} from './schemas/services-cities.schema';
import {
  WashingServicesModelName,
  WashingServicesSchema,
} from './schemas/washing-services.schema';
import { ServicesCitiesRepository } from './repositories/services-cities.repository';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WashingServicesModelName, schema: WashingServicesSchema },
      { name: ServicesCitiesModelName, schema: ServicesCitiesSchema },
    ]),
    ServicesIconsModule,
    CityModule,
    UserModule,
    AdminModule,
  ],
  providers: [
    WashingServicesService,
    WashingServicesRepository,
    ServicesCitiesRepository,
  ],
  controllers: [WashingServicesController],
  exports: [WashingServicesService, WashingServicesRepository],
})
export class WashingServicesModule {}
