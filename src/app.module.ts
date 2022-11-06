import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CityModule } from './city/city.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { BikersModule } from './bikers/bikers.module';
import { WashingServicesModule } from './washing-services/washing-services.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
