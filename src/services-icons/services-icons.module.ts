import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseModule } from '../common/services/firebase/firebase.module';
import {
  ServicesIconsSchema,
  servicesIconModelName,
} from './schemas/services-icons.schema';
import { ServicesIconsController } from './services-icons.controller';
import { ServicesIconsService } from './services-icons.service';
import { AppConfig } from 'src/common/services/app-config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: servicesIconModelName, schema: ServicesIconsSchema },
    ]),
    FirebaseModule,
  ],
  providers: [ServicesIconsService, AppConfig],
  controllers: [ServicesIconsController],
  exports: [ServicesIconsService],
})
export class ServicesIconsModule {}
