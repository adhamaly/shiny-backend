import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CityModule } from './city/city.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { BikersModule } from './bikers/bikers.module';
import { WashingServicesModule } from './washing-services/washing-services.module';
import { ServicesIconsModule } from './services-icons/services-icons.module';
import { PlansModule } from './plans/plans.module';
import { LocationsModule } from './locations/locations.module';
import { GuestModule } from './guest/guest.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB),
    UserModule,
    AuthModule,
    AdminModule,
    CityModule,
    VehiclesModule,
    BikersModule,
    WashingServicesModule,
    ServicesIconsModule,
    PlansModule,
    LocationsModule,
    GuestModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
