import { Global, Module } from '@nestjs/common';
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
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { configSchema } from './common/services/validation';
import { AppConfig } from './common/services/app-config';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, validationSchema: configSchema() }),
    ScheduleModule.forRoot(),
    JwtModule.register({ global: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
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
  providers: [AppConfig],
})
export class AppModule {}
