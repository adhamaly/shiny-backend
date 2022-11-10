import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, User, userModelName } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { FirebaseModule } from '../common/services/firebase/firebase.module';
import { UserRepository } from './user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: userModelName, schema: UserSchema }]),
    forwardRef(() => VehiclesModule),
    FirebaseModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
