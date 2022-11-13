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
import { RouterModule, Routes } from '@nestjs/core';
const routes: Routes = [
  {
    path: '/users',
    module: UserModule,
    children: [
      {
        path: '/washing-services',
        module: WashingServicesModule,
      },
    ],
  },
];
@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB),
    RouterModule.register(routes),
    UserModule,
    AuthModule,
    AdminModule,
    CityModule,
    VehiclesModule,
    BikersModule,
    WashingServicesModule,
    ServicesIconsModule,
    PlansModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
