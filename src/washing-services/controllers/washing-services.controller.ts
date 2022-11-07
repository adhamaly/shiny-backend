import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
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

  @Get('')
  async getAllWashingServicesController() {
    return {
      success: true,
      data: await this.washingServicesService.getAll(),
    };
  }

  @Get(':washingServiceId')
  async getByIdController(@Param('washingServiceId') washingServiceId: string) {
    return {
      success: true,
      data: await this.washingServicesService.getByIdOr404(washingServiceId),
    };
  }

  @Put(':washingServiceId')
  async updateController(
    @Param('washingServiceId') washingServiceId: string,
    @Body() createWashingServiceDTO: CreateWashingServiceDTO,
  ) {
    await this.washingServicesService.update(
      washingServiceId,
      createWashingServiceDTO,
    );
    return {
      success: true,
    };
  }
  @Put(':washingServiceId/activate')
  async activateWashingServiceController(
    @Param('washingServiceId') washingServiceId: string,
  ) {
    await this.washingServicesService.activate(washingServiceId);

    return {
      success: true,
    };
  }
  @Put(':washingServiceId/archive')
  async archiveWashingServiceController(
    @Param('washingServiceId') washingServiceId: string,
  ) {
    await this.washingServicesService.archive(washingServiceId);

    return {
      success: true,
    };
  }
}
