import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { addOnsModelName, AddOnsSchema } from './schemas/add-ons.schema';
import { AdminModule } from '../admin/admin.module';
import { CityModule } from '../city/city.module';
import { ServicesIconsModule } from '../services-icons/services-icons.module';
import { AddOnsService } from './services/add-ons.service';
import { AddOnsRepository } from './repositories/add-ons.repository';
import { AddOnsCitiesRepository } from './repositories/add-ons-cities.repository';
import {
  addOnsCitiesModelName,
  AddOnsCitiesSchema,
} from './schemas/add-ons-cities.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: addOnsModelName, schema: AddOnsSchema },
      { name: addOnsCitiesModelName, schema: AddOnsCitiesSchema },
    ]),
    AdminModule,
    CityModule,
    ServicesIconsModule,
  ],
  providers: [AddOnsService, AddOnsRepository, AddOnsCitiesRepository],
})
export class AddOnsModule {}
