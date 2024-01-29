import { Module, forwardRef } from '@nestjs/common';
import { BikersService } from './services/bikers.service';
import { BikersController } from './controllers/bikers.controller';
import { UserModule } from '../user/user.module';
import { BikerCrudValidator } from './services/bikersCrud.validator';
import { FirebaseModule } from '../common/services/firebase/firebase.module';
import { BikersRepository } from './repositories/bikers.repository';
import { Biker, bikerModelName, BikersSchema } from './schemas/bikers.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { BikerGateway } from './gateway/biker.gateway';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';
import { AppConfig } from 'src/common/services/app-config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: bikerModelName, schema: BikersSchema }]),
    UserModule,
    FirebaseModule,
    AdminModule,
    OrdersModule,
    forwardRef(() => AuthModule),
  ],
  providers: [
    BikersService,
    BikerCrudValidator,
    BikersRepository,
    BikerGateway,
    AppConfig,
  ],
  controllers: [BikersController],
  exports: [BikersService],
})
export class BikersModule {}
