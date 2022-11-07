import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseModule } from '../common/services/firebase/firebase.module';
import {
  ServiceIcon,
  ServicesIconsSchema,
} from './schemas/services-icons.schema';
import { ServicesIconsController } from './services-icons.controller';
import { ServicesIconsService } from './services-icons.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceIcon.name, schema: ServicesIconsSchema },
    ]),
    FirebaseModule,
  ],
  providers: [ServicesIconsService],
  controllers: [ServicesIconsController],
})
export class ServicesIconsModule {}
