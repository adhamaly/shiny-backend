import { Body, Controller, Post } from '@nestjs/common';
import { CreateWashingServiceDTO } from '../dtos';
import { WashingServicesService } from '../services/washing-services.service';

@Controller('washing-services')
export class WashingServicesController {
  constructor(private washingServicesService: WashingServicesService) {}

  @Post('')
  async createWashingServiceController(
    @Body() createWashingServiceDTO: CreateWashingServiceDTO,
  ) {
    await this.washingServicesService.createWashingService(
      createWashingServiceDTO,
    );

    return {
      success: true,
    };
  }
}
