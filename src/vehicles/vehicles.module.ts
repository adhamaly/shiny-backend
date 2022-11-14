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
import { VehiclesRepository } from './vehiclesRepository.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: vehicleModelName, schema: VehicleSchema },
    ]),
    FirebaseModule,
    forwardRef(() => UserModule),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehiclesRepository],
  exports: [VehiclesService, VehiclesRepository],
})
export class VehiclesModule {}
