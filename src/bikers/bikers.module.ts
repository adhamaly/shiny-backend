import { Module } from '@nestjs/common';
import { BikersService } from './bikers.service';
import { BikersController } from './bikers.controller';
import { UserModule } from '../user/user.module';
import { BikerCrudValidator } from './bikersCrud.validator';
import { FirebaseModule } from '../common/services/firebase/firebase.module';

@Module({
  imports: [UserModule, FirebaseModule],
  providers: [BikersService, BikerCrudValidator],
  controllers: [BikersController],
})
export class BikersModule {}
