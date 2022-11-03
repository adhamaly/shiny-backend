import { Module } from '@nestjs/common';
import { BikersService } from './bikers.service';
import { BikersController } from './bikers.controller';
import { UserModule } from '../user/user.module';
import { BikerCrudValidator } from './bikersCrud.validator';
import { FirebaseModule } from '../common/services/firebase/firebase.module';
import { BikersRepository } from './bikers.repository';
import { Biker, BikersSchema } from './schemas/bikers.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Biker.name, schema: BikersSchema }]),
    UserModule,
    FirebaseModule,
  ],
  providers: [BikersService, BikerCrudValidator, BikersRepository],
  controllers: [BikersController],
  exports: [BikersService],
})
export class BikersModule {}
