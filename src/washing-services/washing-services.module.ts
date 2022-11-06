import { Module } from '@nestjs/common';
import { WashingServicesService } from './services/washing-services.service';
import { WashingServicesController } from './controllers/washing-services.controller';
import { WashingServicesRepository } from './repositories/washing-services.repository';

@Module({
  providers: [WashingServicesService, WashingServicesRepository],
  controllers: [WashingServicesController],
})
export class WashingServicesModule {}
