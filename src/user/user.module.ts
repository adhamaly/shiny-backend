import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, User } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { FirebaseModule } from '../common/services/firebase/firebase.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => VehiclesModule),
    FirebaseModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
