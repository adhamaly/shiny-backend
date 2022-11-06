import { Module } from '@nestjs/common';
import { WashingServicesService } from './services/washing-services.service';
import { WashingServicesController } from './controllers/washing-services.controller';
import { WashingServicesRepository } from './repositories/washing-services.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WashingService,
  WashingServicesSchema,
} from './schemas/washing-services.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WashingService.name, schema: WashingServicesSchema },
    ]),
  ],
  providers: [WashingServicesService, WashingServicesRepository],
  controllers: [WashingServicesController],
})
export class WashingServicesModule {}
