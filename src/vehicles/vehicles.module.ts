import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import {
  Vehicle,
  vehicleModelName,
  VehicleSchema,
} from './schemas/vehicles.schema';
import { FirebaseModule } from '../common/services/firebase/firebase.module';
import { UserModule } from '../user/user.module';
import { VehiclesRepository } from './vehicles.repository.';
import { AppConfig } from 'src/common/services/app-config';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: vehicleModelName, schema: VehicleSchema },
    ]),
    FirebaseModule,
    forwardRef(() => UserModule),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehiclesRepository, AppConfig],
  exports: [VehiclesService],
})
export class VehiclesModule {}
