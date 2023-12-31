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
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AddOnsModule } from './add-ons/add-ons.module';
import { ScheduleModule } from '@nestjs/schedule';
import { OrdersModule } from './orders/orders.module';
import { PromoCodeModule } from './promo-code/promo-code.module';
import { PaginationModule } from './common/services/pagination/pagination.module';
import { PointsModule } from './points/points.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB),
    ScheduleModule.forRoot(),
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
    SubscriptionsModule,
    AddOnsModule,
    OrdersModule,
    PromoCodeModule,
    PaginationModule,
    PointsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
