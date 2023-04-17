import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, User, userModelName } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './controllers/user.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { FirebaseModule } from '../common/services/firebase/firebase.module';
import { UserRepository } from './user.repository';
import { UserQueriesHelper } from './userQueriesHelper.service';
import { CityModule } from '../city/city.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { PointsModule } from 'src/points/points.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: userModelName, schema: UserSchema }]),
    forwardRef(() => VehiclesModule),
    forwardRef(() => SubscriptionsModule),
    FirebaseModule,
    CityModule,
    PointsModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserQueriesHelper],
  exports: [UserService, UserRepository, MongooseModule],
})
export class UserModule {}
